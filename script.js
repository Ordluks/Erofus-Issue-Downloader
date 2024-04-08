// ==UserScript==
// @name         Erofus Issue Downloader
// @namespace    http://tampermonkey.net/
// @version      2024-04-08
// @description  download an issue from Erofus.com
// @author       Ordluks
// @match        https://www.erofus.com/comics/various-authors/nyom/and-she-grew/issue-2
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erofus.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict'

    const connectScript = (url) => {
        const scriptElement = document.createElement('script')
        scriptElement.src = url
        document.body.append(scriptElement)
    }

})()
