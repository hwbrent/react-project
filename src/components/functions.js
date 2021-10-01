/* My repeatedly-used non-standard functions */

export function timeAdjust(dateString, h) { // for some reason the date pulled from the API is adjusted (I think because of British Summer Time) so this ensures that the wrong date isn't showed in the table
    const addHoursOperation = new Date(dateString).getTime() + (h*60*60*1000);
    const newDate = new Date(addHoursOperation);
    return newDate.toISOString().slice(0,10);
};

export function rectifyLogsDate(logs) {
    let out = [];
    for (let log of logs) {
        let copy = Object.assign({}, log);
        copy.date = timeAdjust(log.date, 3);
        out.push(copy);
    }
    return out;
};

export function removeObjectKeyValuePairs(obj, keys) {
    const out = {};
    for (let [key, value] of Object.entries(obj)) {
        if (keys.includes(key) === false) out[key] = value;
    }
    return out;
};

export function sortArrayByObjectKey(key) {
    var sortOrder = 1;
    if (key[0] === "-") {
        sortOrder = -1;
        key = key.substr(1);
    }
    return function (a,b) {
        // works w/ strings and numbers
        var result = (a[key] < b[key]) ? -1 : (a[key] > b[key]) ? 1 : 0;
        return result * sortOrder;
    }
}

export function areEqual(obj1, obj2) {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export function findNearestTo(number, iterable) {
    let smallest_difference = Math.abs(number - iterable[0]);
    let index_of_smallest_difference = 0;
    for (let i = 1; i < iterable.length; i++) {
        const diff = Math.abs(number - iterable[i]);
        if (diff < smallest_difference) {
            smallest_difference = diff;
            index_of_smallest_difference = [i];
        } else if (diff === smallest_difference) {
            try {
                index_of_smallest_difference = [...index_of_smallest_difference, i];
            } catch (error) {
                index_of_smallest_difference = [index_of_smallest_difference, i];
            }
        }
    }
    return [smallest_difference, index_of_smallest_difference]
}

export const uppercaseFirstLetter = string => string[0].toUpperCase() + string.slice(1).split("").map(char => char.toLowerCase()).join("");

export const titleCase = string => string.split(" ").map(word => uppercaseFirstLetter(word)).join(" ")
