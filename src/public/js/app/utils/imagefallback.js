import Modernizr from './featuredetection';

export function loadingImage() {
    if(Modernizr.smil){
        return 'img/loader/ring-alt.svg';
    } else {
        return 'img/loader/default.gif';
    }
}
