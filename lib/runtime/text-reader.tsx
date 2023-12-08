/* eslint no-var: 0 */

/* eslint-disable @typescript-eslint/no-explicit-any */
// this component uses the library https://www.readspeaker.com/ that is used to make the content text-to-speech in several languages
// to implement this you need to add "<script src="https://cdn-eu.readspeaker.com/script/11950/webReader/webReader.js?pids=wr" type="text/javascript" id="rs_req_Init"></script>" to the <head> on _document.js
// you have to pass the encoded url and the readid to the <a href />. The readid is the ID attribute of the element containing the content that is to be read.
// if there's any question regarding this implementation should be revised https://admin.readspeaker.com/portal/index.php/documentation/
import { Typography } from 'antd';
import React, { useLayoutEffect, useState } from 'react';

const { Text } = Typography;

interface TextReaderProps {
  // The current locale.
  currentLocale: string;
  // The title of the button for the text reader
  title: string;
}

//Interface definition
interface IReadSpeaker {
  ui: {
    addClickEvents: () => void;
    getActivePlayer: () => { show: () => void; close: () => void };
  };
  p: (cb: (...args: any) => any) => void;
  q: (cb: (...args: any) => any) => void;
  init: () => void;
}

declare var ReadSpeaker: IReadSpeaker;

function TextReader({ currentLocale, title }: TextReaderProps) {
  // readspeaker's script manipulates the DOM which causes a React hydration error.
  // Not showing the readspeaker's button initially fixes the error.
  const [showTextReader, setShowTextReader] = useState(true);
  const [url, setUrl] = useState('');
  const [lang, setLang] = useState('');

  // workaround to make the component work when changing languages
  useLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      ReadSpeaker.p(function () {
        ReadSpeaker.init();
      });
    }

    switch (currentLocale) {
      case 'ar':
        setLang('ar_ar');
        setShowTextReader(true);
        break;
      case 'cs':
        setLang('cs_cz');
        setShowTextReader(true);
        break;
      case 'en-us':
        setLang('en_us');
        setShowTextReader(true);
        break;
      case 'es':
        setLang('es_mx');
        setShowTextReader(true);
        break;
      case 'fa':
        setLang('fa_ir');
        setShowTextReader(true);
        break;
      case 'fr':
        setLang('fr_be');
        setShowTextReader(true);
        break;
      case 'hu':
        setLang('hu_hu');
        setShowTextReader(true);
        break;
      case 'pl':
        setLang('pl_pl');
        setShowTextReader(true);
        break;
      case 'ru':
        setLang('ru_ru');
        setShowTextReader(true);
        break;
      case 'uk':
        setLang('uk_ua');
        setShowTextReader(true);
        break;
      case 'ur':
        setLang('ur_pk');
        setShowTextReader(true);
        break;
      default:
        setShowTextReader(false);
        break;
    }

    // workaround to make the component work when changing languages
    ReadSpeaker.q(function () {
      ReadSpeaker.ui.addClickEvents();
    });
    setUrl(encodeURIComponent(window.location.href)); // the library needs the encoded url to work

    return () => {
      // workaround to make the component stop reading when changing languages
      ReadSpeaker.q(function () {
        if (ReadSpeaker.ui && ReadSpeaker.ui.getActivePlayer()) {
          ReadSpeaker.ui.getActivePlayer().close();
        }
      });
    };
  }, [currentLocale]);

  return (
    <div className="readspeaker-container">
      {showTextReader && (
        <div
          id="readspeaker_button1"
          style={{ zIndex: 'auto' }}
          className="rs_skip rsbtn rs_preserve"
        >
          <a
            rel="nofollow"
            className="rsbtn_play readspeaker"
            title="ReadSpeaker webReader إستمع إلى هذه الصفحةِ مستخدماً"
            href={`https://app-eu.readspeaker.com/cgi-bin/rsent?customerid=11950&amp;lang=${lang}&amp;readid=main-content&amp;url=${url}`}
          >
            <span className="rsbtn_left rsimg rspart">
              <span className="rsbtn_text">
                <Text type="secondary">{title}</Text>
              </span>
            </span>
            <span className="rsbtn_right rsimg rsplay rspart"></span>
          </a>
        </div>
      )}
    </div>
  );
}

export default TextReader;
