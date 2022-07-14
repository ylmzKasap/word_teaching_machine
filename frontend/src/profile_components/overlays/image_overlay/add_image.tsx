// @ts-nocheck

import React, { useContext, useState } from "react";
import axios from "axios";

import { OverlayNavbar } from "../../common/components";
import { ProfileContext } from "../../profile_page/ProfilePage";
import { ProfileContextTypes } from "../../types/profilePageTypes";

export const AddImageOverlay: React.FC = (props) => {
  const { addImageOverlay, setAddImageOverlay } = useContext(ProfileContext) as ProfileContextTypes;

  const handleClick = (event) => {
    const elemId = event.target.id;
    if (/^image-(target|source)-language/.test(elemId)
      || elemId.startsWith("language-info")
      || elemId.startsWith("image-info-input")
      || elemId === "left-number") {
        return;
      }
    setAddImageOverlay({type: "changeEdited", value: ""});
  };
  
  return (
    <div id="add-image-overlay" onClick={handleClick}>
      <OverlayNavbar
        setOverlay={setAddImageOverlay}
        specialClass={"add-image-navbar"}
        description="Image control panel" />
      <AddImageContent imageInfo={addImageOverlay.imageInfo} />
    </div>
  );
};

export const AddImageContent: React.FC = (props) => {
  return (
      <div id="add-image-content">
        <div id="add-image-wrapper">
        {props.imageInfo.map((arr, i) => <AddImageBox
          imageArray={arr}
          order={i}
          key={`image-content-${i}`}
        />)}     
      </div>
    </div>
  );
};

export const LeftNumberBox: React.FC<{order: string}> = (props) => {

  return (
    <div id="left-number-box">
      <div id="left-number">{props.order + 1}</div>
    </div>
  );
};

export const AddImageBox: React.FC = (props) => {
  const getSelectedImage = (imageArray) => {
    let selectedImage;
    let otherImages = [];
    for (const imageObj of imageArray) {
      if (imageObj['selected'] === true) {
        selectedImage = imageObj;
        continue;
      }
      otherImages.push(imageObj);
    }
    return [selectedImage, otherImages];
  };

  const [selectedImage, otherImages] = getSelectedImage(props.imageArray);

  if (!selectedImage) {
    throw 'No image selected';
  }

  return (
    <div id={`add-image-box-${props.order}`}>
      <LeftNumberBox order={props.order} />
      <ImageTranslationBox word={selectedImage} order={props.order} />
      <ImageBox word={selectedImage} order={props.order} />
      {(otherImages.length > 0 || selectedImage.image_path) &&
        <OtherImages images={otherImages} selected={selectedImage} order={props.order} />}
    </div>
  );
};

export const ImageBox: React.FC = (props) => {
  return (
      <div id={`image-box-${props.order}`} className={props.word.image_path ? "" : "not-found"}>
        {props.word.image_path 
        ? <img src={props.word.image_path} alt={props.word.image_path} />
        : <div className="image-not-found">
          <div className="description">add an image</div>
          <i className="fa-solid fa-images fa-2x"></i>
        </div>
        }     
     </div>
  );
};

export const ImageTranslationBox: React.FC = ({word, order}) => {
  const { deckOverlay } = useContext(ProfileContext);

  return (
    <div id={`image-translation-box-${order}`}>
      {word[deckOverlay.language.targetLanguage]
        ? <TranslationBox word={word} order={order} type="targetLanguage" />
        : <TranslationBox
          word={word}
          order={order}
          type="targetLanguage"
          elementClass="not-found" />
      }
      {deckOverlay.includeTranslation && (word[deckOverlay.language.sourceLanguage]
        ? <TranslationBox word={word} order={order} type="sourceLanguage" />
        : <TranslationBox
          word={word}
          order={order}
          type="sourceLanguage"
          elementClass="not-found" />)}
    </div>
  );
};

export const TranslationBox: React.FC = ({word, order, type, elementClass=""}) => {
  const { deckOverlay } = useContext(ProfileContext);
  const { addImageOverlay, setAddImageOverlay } = useContext(ProfileContext);
  
  const componentId = type === "sourceLanguage"
    ? `image-source-language-${order}`
    : `image-target-language-${order}`;
  
  // 'image-info-edited' or 'not-found'
  const componentClass = addImageOverlay.editedId === componentId
    ? "image-info-edited" : elementClass;

  const handleClick = () => {
    if (type === "sourceLanguage" && !word.sourceEditable) {
      setAddImageOverlay({type: "changeEdited", value: ""});
      return;
    };
    setAddImageOverlay({type: "changeEdited", value: componentId});
  };

  return (
    <div id={componentId} className={componentClass} onClick={handleClick} > 
      {addImageOverlay.editedId === componentId
        ? <EditedElement
          elementId={`image-info-input-${order}`}
          order={order}
          language={deckOverlay.language[type]} />
        : componentClass === "not-found"
          ? "add translation"
          : word[deckOverlay.language[type]]}
      {(componentClass === "not-found" && addImageOverlay.editedId !== componentId)
        ? <div id={`language-info-${order}`}> 
          ({deckOverlay.language[type]})
      </div>
      : ""}
    </div>
  );
};

export const OtherImages: React.FC = (props) => {
  const [imagesToDisplay, setImagesToDisplay] = useState(3);

  const generateImages = () => {
    let images = [];
    for (let i=0; i<imagesToDisplay && i<props.images.length ; i++) {
      images.push({
        element: <OtherImage imgObj={props.images[i]} order={props.order}/>,
        key: `${props.images[i].image_path}-${i}`
      }
      );
    }
    return images;
  };

  const handleLoad = (event) => {
    const element = event.target.closest("#other-image-container");
    setImagesToDisplay(i => i + 3);
    setTimeout(() => {
      element.lastChild.scrollIntoView(
        {behavior: "smooth", block: "nearest", inline: "end"});
      }, 100);
  };

  return (
    <div id="other-images">
      <div id="other-images-wrapper">
        <div className="description">
          Other images
          <i className="fas fa-plus-circle image-circle"></i></div>
        <div id="other-image-container">
          {generateImages().map(i => 
            <div className="other-image" key={i.key}> {i.element} </div>)}
          {(props.images.length === 0 && props.selected.image_path) &&
            <div className="no-extra-image">no other image</div>}
          {props.images.length > imagesToDisplay &&
            <div className="load-more-images" onClick={handleLoad}> load more </div>}
        </div>
      </div>
    </div>
  );
};

export const OtherImage: React.FC = ({imgObj, order}) => {
  const { setAddImageOverlay } = useContext(ProfileContext);
  const { deckOverlay } = useContext(ProfileContext);

  const handleClick = () => {
    setAddImageOverlay({type: 'changePicture', value: imgObj.image_path, index: order});
  };

  return (
    <img onClick={handleClick}
    src={imgObj.image_path}
    alt={imgObj[deckOverlay.language.targetLanguage]} />
  );
};

export const EditedElement: React.FC = ({elementId, order, language}) => {
  const { addImageOverlay, setAddImageOverlay } = useContext(ProfileContext);

  const savedInput = addImageOverlay
    .imageInfo[order].filter(x => x.selected === true)[0][language];
  const [inputValue, setInputValue] = useState(savedInput ? savedInput : "");

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const focusOut = () => {
    setAddImageOverlay(
      {type: "changeValue", value: inputValue.trim(), key: language, index: order});
  };

  const enterPress = (event) => {
    if (event.key === "Enter") {
      setAddImageOverlay(
        {type: "changeValue", value: inputValue.trim(), key: language, index: order});
      setAddImageOverlay({type: "changeEdited", value: ""});
    }
  };

  return (
    <input
      id={elementId}
      type="text"
      value={inputValue}
      onChange={handleChange}
      onKeyDown={enterPress}
      onFocus={(event) => event.target.select()}
      onBlur={focusOut}
      autoFocus/>
  );
};