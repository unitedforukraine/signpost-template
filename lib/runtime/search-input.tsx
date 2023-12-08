import { Input } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import axios from 'axios';
import { LatLngExpression } from 'leaflet';
import React, { CSSProperties, useState } from 'react';

const { Search } = Input;

export interface MapCoordinates {
  lat: number;
  lon: number;
  bounds: number[];
}

export interface SearchInputStrings {
  label: string;
}
export interface SearchInputProps {
  strings: SearchInputStrings;
  onCoordinatesUpdate: (coordinates: MapCoordinates | null) => void;
  defaultCoords: LatLngExpression;
  size?: SizeType;
  required?: boolean;
  className?: string;
  style?: CSSProperties;
  shrinkOnTablet?: boolean;
}

/* Search input component. */
export default function SearchInput({
  strings,
  onCoordinatesUpdate,
  defaultCoords,
  size,
  shrinkOnTablet,
}: SearchInputProps) {
  const setSelectMaxWidth = shrinkOnTablet ?? true;
  const [loading, setLoading] = useState(false);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const mapboxGeocode = async (
    query: string,
    defaultCoords: LatLngExpression
  ): Promise<MapCoordinates | null> => {
    const encodedQuery = encodeURIComponent(query);
    const [lon, lat] = defaultCoords as number[];
    //proximity parameter to improve search result relevance
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?proximity=${lat},${lon}&access_token=${mapboxToken}`;

    try {
      const response = await axios.get(url);
      const features = response.data.features;
      const relevantPlaceTypes = [
        'city',
        'region',
        'country',
        'place',
        'locality',
      ];

      // Filter and sort the results
      const sortedFeatures = features
        .filter((feature: { place_type: string[] }) =>
          feature.place_type.some((type) => relevantPlaceTypes.includes(type))
        )
        .sort(
          (
            a: { geometry: { coordinates: number[] } },
            b: { geometry: { coordinates: number[] } }
          ) => {
            const coordsArray = defaultCoords as number[];
            const distA = Math.sqrt(
              Math.pow(a.geometry.coordinates[0] - coordsArray[0], 2) +
                Math.pow(a.geometry.coordinates[1] - coordsArray[1], 2)
            );
            const distB = Math.sqrt(
              Math.pow(b.geometry.coordinates[0] - coordsArray[0], 2) +
                Math.pow(b.geometry.coordinates[1] - coordsArray[1], 2)
            );
            return distA - distB;
          }
        );

      if (sortedFeatures.length > 0) {
        const { coordinates } = sortedFeatures[0].geometry;
        return {
          lat: coordinates[1],
          lon: coordinates[0],
          bounds: sortedFeatures[0].bbox,
        };
      }
    } catch (error) {
      console.log('Error occured', error);
    }
    return null;
  };

  const maybePerformSearch = async (
    query: string,
    defaultCoords: LatLngExpression
  ) => {
    if (query && query !== '') {
      setLoading(true);
      try {
        const result = await mapboxGeocode(query, defaultCoords);
        onCoordinatesUpdate(result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const inputValue = (e.currentTarget as HTMLInputElement).value;
      maybePerformSearch(inputValue, defaultCoords);
    }
  };

  const handleSearch = (value: string) => {
    maybePerformSearch(value, defaultCoords);
  };

  return (
    <div className="search-bar-container w-full sm:w-96">
      <Search
        placeholder={strings.label}
        size={size}
        className={`w-full input search-input ${
          setSelectMaxWidth ? 'input--tabletMaxWidth' : ''
        }`}
        onPressEnter={handleKeyDown}
        enterButton
        loading={loading}
        onSearch={handleSearch}
      />
    </div>
  );
}
