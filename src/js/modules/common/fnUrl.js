const getHost = () => {
    const 	regex=/https?:\/\/([a-z]{3,}\.)?([a-z]{3,}\.[a-z]{2,3})\/$/i;
    let		ref = document.referrer.match(regex),
        code = null;
    if (ref && ref.length===3) {
        switch(ref[2]) {
            case "dna.fr": 				code="DNA";
                break;
            case "lalsace.fr": 			code="ALS";
                break;
            case "estrepublicain.fr":	code="LER"
                break;
            case "vosgesmatin.fr":		code="VOM"
                break;
            case "leprogres.fr":		code="LPR";
                break;
            case "bienpublic.com":		code="LBP";
                break;
            case "lejsl.com":			code="JSL";
                break;
            case "ledauphine.com":		code="LDL";
                break;
        }
    }
    return code;
}


const getUrlParam = (key) => {
    let params = new URLSearchParams(window.location.search);
    return params.get(key);
}

const getHostColor = () => {
    let color;
    switch(getHost()){
        case null : color='#0069b4';
            break;
        case "DNA":	color="#e3013a";
            break;
        case "LPR":	color="#0069b4";
            break;
        default:    color='#e30613';
    }
    return color;
}


export {getUrlParam,getHost,getHostColor}