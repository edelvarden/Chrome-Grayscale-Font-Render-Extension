;(function () {
  function d(b, c) {
    return chrome.i18n.getMessage(b, c)
  }
  ;(function (b) {
    'complete' === document.readyState
      ? window.setTimeout(b, 0)
      : window.addEventListener('DOMContentLoaded', b, !1)
  })(function () {
    function b() {
      return document.querySelectorAll.apply(document, arguments)
    }
    var c = [].map
    c.call(b('[i18n]'), function (a) {
      a.innerHTML = d(a.getAttribute('i18n'))
      a.removeAttribute('i18n')
    })
    c.call(b('[i18n_title]'), function (a) {
      a.setAttribute('title', d(a.getAttribute('i18n_title')))
      a.removeAttribute('i18n_title')
    })
    c.call(b('[i18n_value]'), function (a) {
      a.setAttribute('value', d(a.getAttribute('i18n_value')))
      a.removeAttribute('i18n_value')
    })
  })
})()
