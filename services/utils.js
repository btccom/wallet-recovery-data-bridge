function uniq_fast(a) {
    let seen = {};
    let out = [];
    const len = a.length;
    let j = 0;
    for(let i = 0; i < len; i++) {
        let item = a[i];
        if(seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

module.exports = {
    uniq: uniq_fast,
    asyncForEach: asyncForEach
};
