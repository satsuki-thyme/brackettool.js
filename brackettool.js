/*
  # usage
  * give the text to be processed to the 1st argument "src"
  * give the pair of brackets to process to the 2nd argument "brackets"
    * for example "["{", "}"]"
    * for example "["{", "}", "<", ">"]"
    * for example "[["{", "}"], ["<", ">"]]"
    * for example "["=={", "}=="]"
  * give how to handle brackets the 3rd argument "procType"
    1. "delete" removes brackets
    2. "delete-together" removes brackets with inner contents
    3. "brackets" adds next markup to bracket
      * before brackets: <span class="brackets brackets-before brackets-${i}">
      * after brackets: <span class="brackets brackets-after brackets-${i}">
      * ${i} is a brackets-specific number that is added in the order you give the brackets, and is an integer starting from 0
    4. "contents" removes the brackets and marckup to contents surrounded with brackets
      * <span class="brackets brackets-${i}">
      * ${i} is a brackets-specific number that is added in the order you give the brackets, and is an integer starting from 0
  * if "pickup" is given in the 4th argument "selectMode", the part in brackets will be extracted. no arguments or "hole" will not extract
  * the 5th argument outputType gives the type of list display markup when "pickup" is given as the 4th argument. can be omitted
    * if no argument is given or "array" is returned as an array
    * "ul" returns as a bulleted list (unordered list)
    * "ol" returns a numbered list (ordered list)
  * the 6th argument "beforeNum" gives the number of characters before the brackets to extract when "pickup" is given as the 4th argument
  * the 7th argument "afterNum" gives the number of characters after the brackets to extract when "pickup" is given as the 4th argument
*/
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
          .then(rly => {
            resolve(rly)
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
    let work = src
    if (selectMode === undefined || selectMode === "" || /all|hole/.test(selectMode)) {
      for (let i in brackets) {
        work = work.replace(reRepl(i, true), target(i))
      }
      return work
    }
    else if (/parts?|pickout|pickup/.test(selectMode)) {
      for (let i in brackets) {
        if (reMatch(i, true).test(src)) {
          work = (src.match(reMatch(i, false)) || [``]).map(rly => rly.replace(reRepl(i, true), target(i)).replace(/[\r\n]/g, ""))
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
    function reMatch(i, local) {
      if (local) {
        return new RegExp(`${esc(brackets[i][0])}([\\s\\S]*?)${esc(brackets[i][1])}`, "g")
      }
      else {
        return new RegExp(`[\\s\\S]{0,${beforeNum}}${esc(brackets[i][0])}[\\s\\S]*?${esc(brackets[i][1])}[\\s\\S]{0,${afterNum}}`, "g")
      }
    }
    function reRepl(i, local) {
      if (local) {
        return new RegExp(`(?<!<[^>]*)${esc(brackets[i][0])}([\\s\\S]*?)${esc(brackets[i][1])}`, "g")
      }
      else {
        return new RegExp(`[\\s\\S]{0,${beforeNum}}${esc(brackets[i][0])}[\\s\\S]*?${esc(brackets[i][1])}[\\s\\S]{0,${afterNum}}`, "g")
      }
    }
    function target(i) {
      if (/delete(?!-together)|erase|remove/.test(procType)) {
        return `$1`
      }
      else if (/delete-together/.test(procType)) {
        return ``
      }
      else if (/brackets?/.test(procType)) {
        return `$1<span class="brackets brackets-before brackets-${i}">${brackets[i][0]}</span>$2<span class="brackets brackets-after brackets-${i}">${brackets[i][1]}</span>`
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
