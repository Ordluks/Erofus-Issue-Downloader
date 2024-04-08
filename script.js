// ==UserScript==
// @name         Erofus Issue Downloader
// @namespace    http://tampermonkey.net/
// @version      2024-04-08
// @description  download an issue from Erofus.com
// @author       Ordluks
// @match        https://www.erofus.com/comics/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=erofus.com
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/ramda/0.29.1/ramda.min.js
// ==/UserScript==

(function() {
    'use strict'

    // zip archive function
    const createArchive = () => ({
        __zipFile__: new JSZip()
    })

    const addFile = (name, content, zip) => {
        zip.__zipFile__.file(name, content)
        return { ...zip }
    }

    const generateBlob = (zip) => zip.__zipFile__.generateAsync({ type: 'blob' })

    // DOM functions
    const findPagesLinks = () =>
        [...document.querySelectorAll('.content.col-md-12 > .row-content.row > .col-xs-12.col-sm-6.col-md-4.col-lg-2 > a.a-click')]

    const findFullImage = (dom) =>
        dom.querySelector('#picture-full > a.a-click > img')

    const generateFileName = () => R.compose(R.trim, R.head, R.split)('|', document.title)

    const saveFile = (blob) => {
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = generateFileName()

        link.style.display = 'none'
        document.body.append(link)
        link.click()
    }

    const downloadFullImage = async (url) => {
        const response = await fetch(url)
        return await response.blob()
    }

    const addFullImageToArchive = async (zip, element) => {
        const content = await downloadFullImage(element.src)
        return addFile(element.alt, content, zip)
    }

    const handleLink = (url, callback) => new Promise((resolve) => {
        const imagePage = window.open(url)

        imagePage.addEventListener('load', async () => {
            const element = findFullImage(imagePage.document)
            const result = await callback(element)
            imagePage.close()
            resolve(result)
        })
    })

    const downloadIssue = async () => {
        const _download = async (pages, zip) => {
            if (pages.length === 0) return zip
            const newZip = await handleLink(R.head(pages), R.partial(addFullImageToArchive, [zip]))
            return await _download(R.tail(pages), newZip)
        }

        const resultZip = await _download(findPagesLinks(), createArchive())
        saveFile(await generateBlob(resultZip))
    }

    const button = document.createElement('button')
    button.innerText = 'donwload issue'
    button.style.background = '#393c4b'
    button.style.border = 0
    button.style.fontSize = 12
    button.style.padding = '3px 14px',
    button.style.textTransform = 'uppercase'
    button.addEventListener('click', downloadIssue)

    const container = document.querySelector('.navigation-breadcrumb')

    if (container) {
        container.style.display = 'flex'
        container.style.justifyContent = 'space-between'
        container.style.alignItems = 'center'
        container.append(button)
    }
})()
