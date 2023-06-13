
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function lowerFirstLetter(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
}

module.exports = {
    capitalizeFirstLetter: capitalizeFirstLetter,
    lowerFirstLetter: lowerFirstLetter
}