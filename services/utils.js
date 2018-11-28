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

module.exports = {
    uniq: uniq_fast
};
