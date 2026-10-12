jQuery(document).ready(function($){

    //fix for stupid ie object cover
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      jQuery('.featured-box-img-cover').each(function(){
          var t = jQuery(this),
              s = 'url(' + t.attr('src') + ')',
              p = t.parent(),
              d = jQuery('<div></div>');
  
          p.append(d);
          d.css({
              'height'                : '290',
              'background-size'       : 'cover',
              'background-repeat'     : 'no-repeat',
              'background-position'   : '50% 20%',
              'background-image'      : s
          });
          t.hide();
      });
    }

    // alertbar later
    $(document).scroll(function () {
        var y = $(this).scrollTop();
        if (y > 280) {
            $('.alertbar').fadeIn();
        } else {
            $('.alertbar').fadeOut();
        }
    });


    // Add clickable permalink anchors to post headings (h2-h6 with an id).
    // The href is percent-encoded so copied/shared links (accented ids included)
    // are valid, portable URLs instead of raw UTF-8 characters.
    $('.article-post h2[id], .article-post h3[id], .article-post h4[id], .article-post h5[id], .article-post h6[id]').each(function() {
        var $heading = $(this);
        var encodedId = encodeURIComponent($heading.attr('id'));
        $heading.append(
            ' <a class="heading-anchor" href="#' + encodedId + '" aria-label="Link direto para esta seção">#</a>'
        );
    });

    // Smooth on external page
    $(function() {
      // `location.hash` / `a.hash` come back percent-encoded for non-ASCII ids (e.g. accents),
      // and `$('#' + hash)` throws on that as an invalid CSS selector, so resolve via
      // getElementById on the decoded id instead.
      function resolveHashTarget(hash) {
        var id = decodeURIComponent((hash || '').replace(/^#/, ''));
        if (!id) {
          return $();
        }
        var el = document.getElementById(id);
        return el ? $(el) : $('[name="' + id + '"]');
      }

      function navBarOffset() {
        // Compensate for the fixed navbar so the section title isn't hidden behind it
        return ($('nav.mediumnavigation').outerHeight() || 0) + 20;
      }

      function snapTo(target) {
        $('html,body').scrollTop(target.offset().top - navBarOffset());
      }

      function smoothScrollTo(target) {
        if (target && target.length) {
          $('html,body').animate({
            scrollTop: target.offset().top - navBarOffset()
          }, 1000);
        }
      }

      // Content that renders asynchronously after the initial jump (MathJax formulas,
      // mermaid diagrams, lazy images, embeds) can shift the layout and throw the scroll
      // position off target. Keep re-snapping to the target while the page settles, and
      // stop as soon as the reader scrolls manually.
      function keepTargetInPlace(target) {
        if (!target || !target.length) {
          return;
        }

        var userScrolled = false;
        var stop = function() {
          userScrolled = true;
          $(window).off('wheel touchstart', stop);
        };
        $(window).one('wheel touchstart', stop);

        var elapsed = 0;
        var interval = setInterval(function() {
          elapsed += 300;
          if (userScrolled || elapsed >= 3000) {
            clearInterval(interval);
            return;
          }
          snapTo(target);
        }, 300);
      }

      setTimeout(function() {
        if (location.hash) {
          /* we need to scroll to the top of the window first, because the browser will always jump to the anchor first before JavaScript is ready, thanks Stack Overflow: http://stackoverflow.com/a/3659116 */
          window.scrollTo(0, 0);
          var target = resolveHashTarget(location.hash);
          smoothScrollTo(target);
          keepTargetInPlace(target);
        }
      }, 1);

      // Copy a heading anchor's absolute URL to the clipboard, with a fallback for
      // browsers/contexts where the async Clipboard API isn't available.
      function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text);
          return;
        }
        var $tmp = $('<textarea readonly></textarea>').val(text).css({
          position: 'fixed',
          top: '-1000px',
          left: '-1000px'
        }).appendTo('body');
        $tmp[0].select();
        try {
          document.execCommand('copy');
        } catch (e) {}
        $tmp.remove();
      }

      function flashCopied($link) {
        $link.addClass('copied');
        clearTimeout($link.data('copiedTimeout'));
        var timeoutId = setTimeout(function() {
          $link.removeClass('copied');
        }, 1500);
        $link.data('copiedTimeout', timeoutId);
      }

      // taken from: https://css-tricks.com/snippets/jquery/smooth-scrolling/
      $('a[href*=\\#]:not([href=\\#])').click(function() {
        if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
          var $link = $(this);
          var target = resolveHashTarget(this.hash);

          if ($link.hasClass('heading-anchor')) {
            copyToClipboard(this.href);
            flashCopied($link);
            if (history.pushState) {
              history.pushState(null, '', this.hash);
            }
          }

          smoothScrollTo(target);
          keepTargetInPlace(target);
          return false;
        }
      });
    });
    
    
    // Hide Header on on scroll down
    var didScroll;
    var lastScrollTop = 0;
    var delta = 5;
    var navbarHeight = $('nav').outerHeight();

    $(window).scroll(function(event){
        didScroll = true;
    });

    setInterval(function() {
        if (didScroll) {
            hasScrolled();
            didScroll = false;
        }
    }, 250);

    function hasScrolled() {
        var st = $(this).scrollTop();
        
        // Make sure they scroll more than delta
        if(Math.abs(lastScrollTop - st) <= delta)
            return;

        // If they scrolled down and are past the navbar, add class .nav-up.
        // This is necessary so you never see what is "behind" the navbar.
        if (st > lastScrollTop && st > navbarHeight){
            // Scroll Down            
            $('nav').removeClass('nav-down').addClass('nav-up'); 
            $('.nav-up').css('top', - $('nav').outerHeight() + 'px');
           
        } else {
            // Scroll Up
            if(st + $(window).height() < $(document).height()) {               
                $('nav').removeClass('nav-up').addClass('nav-down');
                $('.nav-up, .nav-down').css('top', '0px');             
            }
        }

        lastScrollTop = st;
    }
        
    $('.site-content').css('margin-top', $('header').outerHeight() + 'px');  
    
    // spoilers
     $(document).on('click', '.spoiler', function() {
        $(this).removeClass('spoiler');
     });
    
 });   

// deferred style loading
var loadDeferredStyles = function () {
	var addStylesNode = document.getElementById("deferred-styles");
	var replacement = document.createElement("div");
	replacement.innerHTML = addStylesNode.textContent;
	document.body.appendChild(replacement);
	addStylesNode.parentElement.removeChild(addStylesNode);
};
var raf = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if (raf) raf(function () {
	window.setTimeout(loadDeferredStyles, 0);
});
else window.addEventListener('load', loadDeferredStyles);
