# brackettool.js
文章内の括弧を処理する JavaScript のライブラリです。

## 目次
* brackettool.js  
ライブラリ本体。
* brackettool.min.js  
ライブラリ本体。圧縮版。
* sample.html  
使い方のサンプル。
* brackettool.html  
応用編。

## 説明
* 括弧の処理パターンは 3 つあります
    1. 括弧を削除する
    2. 括弧を HTML でマークアップする
    3. 括弧を削除して括弧内の文字列を HTML でマークアップする
* 括弧とその周辺部のみをピックアップして返すモードがあります

## 使い方
* 第 1 引数 src には処理の対象となる文章を与えます
* 第 2 引数 brackets には処理する括弧の対を与えます
    * "\["{", "}"\]" のように配列で与えてください
    * "\["{", "}", "<", ">"\]" のように複数を与えることもできます
    * "\[\["{", "}"\], \["<", ">"\]\]" のようにすることもできます
    * "\["=={", "}=="\]" のように括弧として複数の文字列を与えることもできます
* 第 3 引数 procType には括弧を処理する方法を与えます
    1. "delete" とすると括弧を削除します
    2. "brackets" とすると括弧に以下のマークアップが加えられます
        * 前括弧 <span class="brackets brackets-before brackets-${i}">
        * 後ろ括弧 <span class="brackets brackets-after brackets-${i}">
        * ${i} は括弧を与えた順番に付けられる括弧固有の数値で 0 から始まる整数です
    3. "contents" とすと括弧を削除して括弧に囲われていた部分に以下のマークアップが加えられます
        * <span class="brackets brackets-${i}">
        * ${i} は括弧を与えた順番に付けられる括弧固有の数値で 0 から始まる整数です
* 第 4 引数 selectMode で "pickup" を与えると括弧の部分を抜き出します。引数を与えないか "hole" を与えると抜き出しを行いません
* 第 5 引数 outputType には第 4 引数で "pickup" を与えた際のリスト表示のマークアップの種類を与えます。省略することが可能です
    * 引数を与えないか "array" とすると配列として返します
    * "ul" とすると箇条書き（順序なしリスト）として返します
    * "ol" とすると数字付き箇条書き（順序付きリスト）として返します
* 第 6 引数 beforeNum では第 4 引数で "pickup" を与えた際に抜き出す括弧以前の文字数を与えます
* 第 7 引数 afterNum では第 4 引数で "pickup" を与えた際に抜き出す括弧以後の文字数を与えます

## CDN
https://cdn.jsdelivr.net/gh/satsuki-thyme/brackettool.js@main/brackettool.min.js
