const android = {
    "key1": {
        "vn": "value_vn_1",
        "de": "value_de_1",
        "en": "value_en_1"
    },
    "key2": {
        "vn": "value_vn_1",
        "de": "value_vn_1",
        "en": "value_en_2"
    },
    "key3": {
        "vn": "value_vn_3",
        "de": "value_de_3",
        "en": "value_en_3"
    }
    ,
    "key4": {
        "vn": "value_vn_1",
        "de": "value_vn_1",
        "en": "value_vn_1"
    }
}

const ios = {
    "key_ios_1": {
        "vn": "value_vn_1",
        "de": "value_vn_1",
        "en": "value_vn_1"
    },
    "key_ios2": {
        "vn": "value_vn_2",
        "de": "value_vn_2",
        "en": "value_vn_2"
    },
    "key_ios3": {
        "vn": "value_vn_3",
        "de": "value_vn_3",
        "en": "value_vn_3"
    },
    "key_ios4": {
        "vn": "value_vn_4",
        "de": "value_vn_3",
        "en": "value_vn_4"
    },
    "key_ios5": {
        "vn": "value_vn_5",
        "de": "value_vn_5",
        "en": "value_vn_5"
    }
}

const country = "vn"

const androidByCountry = {}

// xử lý dữ liệu bên android
// lấy country = "vn" làm key mới
for (const oldKey in android) {
    // lưu lại key cũ trong value
    android[oldKey].oldKey = oldKey

    // giá trị của key mới
    const newKey = android[oldKey][country].trim().replace(/\n?\r|\r/g, "\\n")

    // vì key mới có thể trùng lặp nên ta lưu vào mảng
     if (!androidByCountry[newKey]) androidByCountry[newKey] = []
     
     // push value của key mới vào mảng
     androidByCountry[newKey].push(android[oldKey])
}

// xử lý dữ liệu bên ios

for (const oldKey in ios) {
    const newKey = ios[oldKey][country].trim().replace(/\n?\r|\r/g, "\\n")

    if (!androidByCountry[newKey] || !androidByCountry[newKey].length) {
        // nếu trong android không có key mới này thì tức là chỉ bên ios có và cần gửi đi lấy thêm
        for (const country in ios[oldKey]) {
            ios[oldKey][country + "_android"] = ""
        }  
    } else {
        // trọng số đánh dấu đâu là localize bên android có xác suất là của oldKey bên ios nhất
        let maxTrueWeight = 0;
        let maxTrueLocalize = undefined;
        for (const andLocalize of androidByCountry[newKey]) {
            let trueWeight = 0;
            for (const country in ios[oldKey]) {
                if (ios[oldKey][country] === andLocalize[country]) {
                    if (++trueWeight > maxTrueWeight) {
                        maxTrueWeight = trueWeight
                        maxTrueLocalize = andLocalize
                    }
                }
            }
        }

        if (maxTrueLocalize !== undefined) {
            for (const country in ios[oldKey]) {
                ios[oldKey][country + "_android"] = maxTrueLocalize[country]
            }  
        } 
    } 
}

console.log(ios);