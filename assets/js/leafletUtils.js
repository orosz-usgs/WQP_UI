/*
 * @param {L.LatLngBounds} bounds
 * @returns a string representing bounds as south,west,north,east
 */
export const toBBoxString = function(bounds) {
    return bounds.getSouth() + ',' + bounds.getWest() + ',' + bounds.getNorth() + ',' + bounds.getEast();
};
