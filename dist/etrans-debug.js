/**
  * a light & easy Stage-Trans lib for mobile web apps
  * License MIT (c) 岑安
  */

;(function (name, definition) {
    if (typeof define == 'function') define(definition);
    else if (typeof module != 'undefined') module.exports = definition();
    else this[name] = definition();
})('ETrans', function () {
    
    var $support = {
        transform3d: ('WebKitCSSMatrix' in window),
        touch: ('ontouchstart' in window)
    };
    function getTranslateY(y) {
        return $support.transform3d ? 'translate3d(0, '+y+'px, 0)' : 'translate(0, '+y+'px)';
    }
    function getTranslateX(x) {
        return $support.transform3d ? 'translate3d('+x+'px, 0, 0)' : 'translate('+x+'px, 0)';
    }
    function getStyle(el, property) {
        var value = null,
            computed = document.defaultView.getComputedStyle(el, '');
        computed && (value = computed[property]);
        return el.style[property] || value;
    }
    function getTranslate(el) {
        var transform = getStyle(el, 'webkitTransform'),
            reg = /translate(X|Y|Z|3d)?\(([^\)]+)\)/;
        var ret = transform.match(reg);
        var result = {x:0, y:0, z:0};
        
        if (ret) {
            if (!ret[1]) {
                var xy = ret[2].split(',');
                result.x = parseInt(xy[0]);
                result.y = parseInt(xy[1]||0);
            } else if (ret[1] == 'X') {
                result.x = parseInt(ret[2]);
            } else if (ret[1] == 'Y') {
                result.y = parseInt(ret[2]);
            } else if (ret[1] == 'Z') {
                result.z = parseInt(ret[2]);
            } else if (ret[1] == '3d') {
                var xyz = ret[2].split(',');
                result.x = parseInt(xy[0]||0);
                result.y = parseInt(xy[1]||0);
                result.z = parseInt(xy[2]||0);
            }
            
            return result;
        }
    }
    function trim (s) {
        if (String.prototype.trim) {
            return s.trim();
        } else {
            return s.replace(/(^\s*|\s*$)/g, '');
        }
    }
    
    /**
     * @param map {Object}
      {
        '^main' : '#main',
        '^search': '.search-container',
        '^item': '.item-container'
      }
      
      @param conf {Object}
      {
        driveByHash: true,
        backward: ['^item > *', '^search > ^main']
      }
     */
    var ETrans = function (map, conf) {
        this._prevHash = null;
        this._curHash = null;
        this._prevEl = null;
        this._curEl = null;

        this.setMap(map);
        this.setConf(conf);
        this._bindEvents();
        this.navigate(location.hash);
    };
    ETrans.prototype = {
        setMap: function (obj) {
            var _hash2reg = {};
            for (var k in obj) {
                if (typeof obj[k] == 'string') {
                    obj[k] = document.querySelector(obj[k]);
                    if (obj[k]) {
                        obj[k].setAttribute('data-mh', k);
                    }
                    _hash2reg[k] = new RegExp(k);
                }
            }
            
            this.map = obj;
            this._hash2reg = _hash2reg;
        },
        setConf: function (conf) {
            if (typeof conf == 'object') {
                this.conf = conf;
                this.driveByHash = !!this.conf.driveByHash;
                if (this.conf.backward) {
                    this.conf._backward = this.conf._backward || {};
                    
                    for (var i = 0; i < this.conf.backward.length; i ++) {
                        var k = this.conf.backward[i];
                        
                        var kk = k.split('>');
                        var prev_h = trim(kk[0]),
                            cur_h = trim(kk[1]);
                        if (prev_h == '*') {
                            for (var h in this.map) {
                                if (h != cur_h) {
                                    var new_k = h + ' > ' + cur_h;
                                    this.conf._backward[new_k] = 1;
                                }
                            }
                        } 
                        
                        if (cur_h == '*') {
                            for (var h in this.map) {
                                if (h != prev_h) {
                                    var new_k = prev_h + ' > ' + h;
                                    this.conf._backward[new_k] = 1;
                                }
                            }
                        }
                        
                        this.conf._backward[k] = 1;
                    }
                }
                
                console.log(this.conf);
            } else {
                this.driveByHash = !!conf;
            }
        },
        setLoadingTip: function (o) {
            if (typeof o.show == 'function' && typeof o.hide == 'function') {
                this.loadingTip = o;
            }
        },
        _bindEvents: function () {
            var me = this;
            window.addEventListener( 'hashchange', function (e) { me._onHashChange() }, false );
        },
        _onHashChange: function () {
            //todo
            this.driveByHash && this.navigate(location.hash);
        },
        _getElByHash: function (hash) {
            var key;
            for (var k in this._hash2reg) {
                if (this._hash2reg[k].test(hash)) {
                    return this.map[k];
                }
            }
        },
        _isBackward: function (prevEl, curEl) {
            if (this.conf && prevEl && curEl) {
                var ph = trim(prevEl.getAttribute('data-mh')),
                    ch = trim(curEl.getAttribute('data-mh'));
                if (ph && ch) {
                    var key = ph + ' > ' + ch;
                    return !!this.conf._backward[key];
                }
            }
            return false;
        },
        navigate: function (hash, dir) {
            if (dir == undefined) { dir = -1 }
            this._prevHash = this._curHash;
        
            var hash = location.hash.replace(/^#/, '');
            var el = this._getElByHash(hash);
            
            if (el) {
                this._curHash = hash;
                this._prevEl = this._curEl;
                
                if (this._prevEl == el) { 
                    el.style.display = 'block';
                    return;
                } else {
                    //stage trans
                    if (this._prevEl) {
                        dir = this._isBackward(this._prevEl, el) ? 1 : -1;
                    
                        var ow = this._prevEl.offsetWidth;
                        this._prevEl.style.webkitTransitionDuration = '350ms';
                        console.log(getTranslateX(dir*ow))
                        this._prevEl.style.webkitTransform = getTranslateX(dir*ow);
                        this.loadingTip && this.loadingTip.show();
                        
                        setTimeout(function (prev_el) {
                            return function () {
                                prev_el.style.webkitTransitionDuration = 0;
                                prev_el.style.webkitTransform = 'none';
                                prev_el.style.display = 'none';
                                
                                el.style.display = 'block';
                                
                                this.loadingTip && this.loadingTip.hide();
                            }
                        }(this._prevEl), 350);
                    } else {
                        el.style.display = 'block';
                    }
                }
                this._curEl = el;
            }
        },
        forward: function (hash, isReplace) {
            if (isReplace == undefined) { isReplace = true; }
            var _isDrive = this.driveByHash,
                me = this;
                
            this.driveByHash = false;
            if (isReplace) { 
                location.hash = '#' + hash.replace(/^#/, '');
            }
            this.navigate(hash, -1);
            setTimeout(function () {
                me.driveByHash = _isDrive; 
            }, 0);
        },
        backward: function (hash, isReplace) {
            if (isReplace == undefined) { isReplace = true; }
            var _isDrive = this.driveByHash,
                me = this;
                
            if (!hash) {
                hash = this._prevHash;
            }
            
            this.driveByHash = false;
            if (isReplace) { 
                location.hash = '#' + hash.replace(/^#/, '');
            }
            this.navigate(hash, 1);
            setTimeout(function () {
                me.driveByHash = _isDrive; 
            }, 0);
        }
    };
    
    
    return ETrans;

});