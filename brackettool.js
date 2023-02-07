async function brackettool(src, brackets, procType, selectMode, outputType, beforeNum, afterNum) {
  let message = {
    "oddBrackets": "括弧の指定が奇数です。",
    "invalidBrackets": "引数 brackets の値の型が無効です。",
    "invalidSelectMode": "引数 selectMode の値が無効です。",
    "invalidProcType": "引数 procType の値が無効です。",
    "mismatchBrackets": "一致しない brackets があります。",
    "invalidOutputType": "引数 outputType の値が無効です"
  }
  return makePair()
  .then(rly => {
    return procRepl(rly)
  })
  /*

    括弧のペアを作る
  
  */
  function makePair() {
    let row = []
    return new Promise((resolve, reject) => {
      collectElements(brackets, [])
      /*

        一次元化した配列（括弧のリスト入り）を並べ替える
      
      */
      .then(() => {
        if (row.length % 2 === 0) {
          let digits = []
          for (let i in row) {
            for (let j in row[i].id) {
              if (digits[j] === undefined) {
                digits[j] = 0
              }
              digits[j] = Math.max(digits[j], row[i].id[j].toString().length)
            }
          }
          digits = digits.map(rly => rly.toString().length)
          for (let i in row) {
            for (let j in row[i].id) {
              let work = `${"0".repeat(digits[j])}${row[i].id[j]}`
              row[i].id[j] = work.substring(work.length - digits[j], work.length)
            }
            row[i].upper = row[i].id.slice(0, row[i].id.length - 1)
          }
          row.sort((a, b) => a.id.join("") - b.id.join("")).map(rly => [rly.brackets, rly.upper])
          let rowResults = []
          for (let i = 0; i < row.length / 2; i++) {
            if (row[i * 2].upper.join("") !== row[i * 2 + 1].upper.join("")) {
              reject(message.oddBrackets)
            }
            rowResults[i] = [row[i * 2].brackets, row[i * 2 + 1].brackets] 
          }
          resolve(rowResults)
        }
        else {
          reject(message.oddBrackets)
        }
      })
      .catch(rly => {
        reject(rly)
      })
    })
    /*

      括弧のリストが入った多次元配列の一次元化
    
    */
    function collectElements(brackets, id) {
      return new Promise((resolve, reject) => {
        if (typeof brackets === "string" || brackets instanceof String) {
          row.push(
            {
              "id": id,
              "brackets": brackets
            }
          )
          resolve()
        }
        else if (Array.isArray(brackets)) {
          let promiseArray = []
          for (let i in brackets) {
            promiseArray.push(collectElements(brackets[i], id.concat(i)))
          }
          Promise.all(promiseArray)
          .then(() => {
            resolve()
          })
        }
        else {
          reject(message.invalidBrackets)
        }
      })
    }
  }
  /*

    括弧の処理
  
  */
  function procRepl(brackets) {
    let work = ""
    if (selectMode === undefined || selectMode === "" || /all|hole/.test(selectMode)) {
      for (let i in brackets) {
        work = src.replace(rx(i, true), target(i))
      }
      return work
    }
    else if (/parts?|pickout|pickup/.test(selectMode)) {
      for (let i in brackets) {
        if (rx(i, true).test(src)) {
          work = src.match(rx(i, false)).map(rly => rly.replace(rx(i, true), target(i)))
        }
        else {
          console.log(message.mismatchBrackets)
        }
      }
      if (/array|row/.test(outputType)) {
        return work
      }
      else if (outputType === undefined || outputType === "" || /list|ul|ol/.test(outputType)) {
        let liSet = ""
        for (let i in work) {
          liSet += `<li>${work[i]}</li>\n`
        }
        switch(outputType) {
          case /list|ul/:
            return `<ul>\n${liSet}</ul>\n`
          case "ol":
            return `<ol>\n${liSet}</ol>\n`
          default:
            return `<ul>\n${liSet}</ul>\n`
        }
      }
      else {
        console.log(message.invalidOutputType)
        return false
      }
    }
    else {
      console.error(message.invalidSelectMode)
      return false
    }
    function rx(i, local) {
      if (local) {
        return new RegExp(`${esc(brackets[i][0])}([\\s\\S]*?)${esc(brackets[i][1])}`, "g")
      }
      else {
        return new RegExp(`[\\s\\S]{0,${beforeNum}}${esc(brackets[i][0])}[\\s\\S]*?${esc(brackets[i][1])}[\\s\\S]{0,${afterNum}}`, "g")
      }
    }
    function target(i) {
      if (/delete|erase|remove/.test(procType)) {
        return `$1`
      }
      else if (/brackets?/.test(procType)) {
        return `<span class="brackets brackets-before brackets-${i}">${brackets[i][0]}</span>$1<span class="brackets brackets-after brackets-${i}">${brackets[i][1]}</span>`
      }
      else if (/contents?/.test(procType)) {
        return `<span class="brackets brackets-${i}">$1</span>`
      }
      else {
        console.error(message.invalidProcType)
        return false
      }
    }
  }
  function esc(r) {
    if (typeof r === "string" || r instanceof String) return p(r)
    else if (Array.isArray(r)) return r.map(r => r = p(r))
    else return r
    function p(r) {
      return r.replace(/(\/|\\|\^|\$|\*|\+|\?|\.|\(|\)|\[|\]|\{|\})/g, "\\$1")
    }
  }
}
