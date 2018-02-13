/*
 *	A global namespace for AFS.
 *
 */

window.AFS = (function($) {

	var HELVETICA_REGULAR= '.cufon_helvregular';
	var HELVETICA_BOLD = '.cufon_helvbold';
	var HELVETICA_LIGHT = '.cufon_helvlight';
	var HELVETICA_LIGHT_SHADOW = '.cufon_helvlightshadow';

	var AFS = {
		initStickyNav: function(el) {
		    var element = $(el);
		    if (element.length) {
			    $(window).bind('scroll', function() {
			        var windowTop = $(window).scrollTop();
			        var sticky = $(element).data('sticky');
			        var elTop = element.offset().top;
			        if (!sticky && windowTop > elTop) {
			            var clone = element.clone(true);
			            element.data('sticky', clone);
			            clone.attr('id', 'sticky-nav');
			            clone.addClass('sticky');
			            element.before(clone);
			            clone.css({
			                'position': 'fixed',
			                'top': 0,
			                'width': element.width(),
			                'z-index': 100
			            });
			        } else if (sticky && windowTop <= elTop) {
			            var sticky = element.data('sticky');
			            if (sticky) {
			                sticky.remove();
			                element.data('sticky', null);
			            }
			        }
			    }.bind(this));
			}

		},

		initDivToggler: function(selector) {
			if ($(selector).closest('select').find('option:selected')) {
				var showId = $(selector).closest('select').find('option:selected').attr('data-showid');
				$('.hide').hide();
				$('#'+showId).show();
			}
			$(selector).closest('select').change(function(e) {
				var showId = $(this).find('option:selected').attr('data-showid');
				$('.hide').hide();
				$('#'+showId).show();
			});

		},

		initSearchCompletion: function (source, config) {
		    config = config || {};
		    var type = (typeof source === 'string') ? 'autocomplete' : 'autocompleteArray';
		    $('.field_search').each(function(){
		        $(this).find('input')[type](source, config);
		    });
		},

		initSearchHelpTooltip: function () {
		    var storageKey      = 'searchtooltip',
		        maxViews        = 3, /* max tooltip views in order to terminate */
		        currentView     = 0, /* counter, how many times the tooltip has been shown */
		        maxCharsView    = 3, /* if the input contains more then 3 chars, hide the tooltip */
		        searchTooltip   = $('.search-help--tooltip'),
                input           = $('.use-search-helper'),
                searchHelp      = $('.search-help'),
                searchHelpClose = $('.search-help--tooltip-close'),
                tooltipHeight   = searchTooltip.outerHeight(),
                inputHeight     = input.outerHeight(),
                inputWidth      = input.innerWidth(),
                inputOffset     = input.offset(),
                inputPosition   = input.position(),
                manualPadX      = 15;
		    if (inputOffset) {
		        searchTooltip
		            .css('left', ((inputOffset.left + inputWidth) + manualPadX) + 'px')
		            .css('top', ((inputOffset.top - tooltipHeight / 2) + inputPosition.top) + 'px');
		    }

		    // Initialize localstorage
            $.localStorage(storageKey, ($.localStorage(storageKey) || currentView));

            function showSearchAssistantByKeystrokes () {
                if($.localStorage(storageKey) < (maxViews - 1)) {
                    if(input.val().length < (maxCharsView + 1)) {
                        showSearchAssistant();
                    } else {
                        hideSearchAssistant();
                    }
                }
            }

            function showSearchAssistant () {
                searchTooltip.fadeIn();
            }

		    function hideSearchAssistant () {
		        searchTooltip.fadeOut();
                $.localStorage(storageKey, currentView++);
		    };

		    function terminateSearchAssistant () {
		        hideSearchAssistant();
                $.localStorage(storageKey, maxViews);
		    };

            input.bind('keyup', showSearchAssistantByKeystrokes);
            searchHelp.bind('click', showSearchAssistant);
            searchHelpClose.bind('click', terminateSearchAssistant);
		},

        initLanguageOptions: function(selector) {
            var trigger = $(selector);
            if (trigger.length) {
                var options = $('#language_optionlist');
                if (options.length) {
                    trigger.on('click', function(event) {
                        event.preventDefault();
                        options.addClass('active');
                    });
                    options.on('mouseleave', function() {
                        this.languageoptiontimer = setTimeout(function(){
                            options.removeClass('active');
                        }, 1000);
                    });
                    options.on('mouseenter', function() {
                        clearTimeout(this.languageoptiontimer);
                    });
                }
            }
        },

		initialize: function() {

			/*
			 * Notify the DOM JavaScript is enabled.
			 */

			$('body').addClass('js_enabled');

			/*
			 * Initializing methods.
			 */

			this.initStickyNav('.nav_sticky');
			this.initDivToggler('[data-showid]');
			this.initSearchHelpTooltip();
            this.initLanguageOptions('#language_optionlist_trigger');

            var source = '/handlers/searchautocomplete.ashx';
            this.initSearchCompletion(source, {
                maxItemsToShow: 3
            });

			/*
			 * Configure Cufon
			 *
			 */

			Cufon.set({ hover: true, autoDetect: true });
			Cufon.replace(HELVETICA_REGULAR, { fontFamily: 'helvetica' });
			Cufon.replace(HELVETICA_BOLD, { fontFamily: 'HelveticaNeueBold' });
			Cufon.replace(HELVETICA_LIGHT, { fontFamily: 'HelveticaNeueLight' });
			Cufon.replace(HELVETICA_LIGHT + ' strong', { fontFamily: 'HelveticaNeueBold' });
			Cufon.replace(HELVETICA_LIGHT_SHADOW, { fontFamily: 'HelveticaNeueLight', textShadow: '1px 2px rgba(0,0,0,0.5)' });
			LBi.Dispatcher.subscribe(LBi.Event.NODE_INSERTED, function() { Cufon.refresh(); });

			/*
			 * Configure Links
			 *
			 */

			var Links = new LBi.LinkRelations();

			// handle printing.
			Links.subscribe(/print/, function(e) {
				e.preventDefault();
				window.print();
			});

			// handle more links.
			Links.subscribe(/more/, function(e) {
				e.preventDefault();
				var target = $(e.target);
				var content = $(target.attr('href'));
				if (content.is(':hidden')) {
					target.addClass('less');
					content.show();
				} else {
					target.removeClass('less');
					content.hide();
				}
				var text = target.html();
				var label = target.attr('alt');
				target.attr('alt', text);
				target.html(label);
			});

			// forward sitestat clicks
			LBi.subscribe('click:link', function(e) {
				var stat = $(e.target).attr('af:sitestat');
				if(stat && AFS.Sitestat) {
					try {
						AFS.Sitestat.pageView(stat);
					} catch (e) {
					}
				}
			});




			/*
			 * Submit forms via enter
			 *
			 */

			var field;
			$('input:text').focus(function() {
				field = this;
			});

			$('form').keydown(function(e) {
				if (e.which === 13) {
					var sub = $(field).closest('fieldset').find('[type=submit]').get(0);
					if (sub) {
						e.preventDefault();
						sub.click();
					}
				}
			});

			/*
			 * Configure Primary Nav
			 *
			 */
			this.simpleMenu = new LBi.SimpleMenu(document.getElementById("cd-them"), {
				openDelay: 200,
				closeDelay: 300,
				menuSelector: '.nav_sub',
				touchEnabled: !!('ontouchstart' in window),
				toggleMenu: function(element, toggle) {
					var target = $(element)[toggle? 'addClass' : 'removeClass'](this.activeClass);
					var sub = target.find('.nav_sub');
					if(sub.length) {
						if(toggle) {
							sub.show();
						} else {
							sub.hide();
						}
						LBi.Dispatcher.fire('menu:toggle', sub[0]);
					}
				}
			});

			/*
			 * Configure Form Enhancements
			 *
			 */
			this.forms = new LBi.Forms();

			/*
			 * Configure Carousel
			 *
			 */
			$('.carousel').carousel({});

			/*
			 * Configure triggers
			 *
			 */
			this.triggers = new LBi.Trigger('.trigger');
            this.triggers = new LBi.Trigger('.list_news li');
			this.triggers = new LBi.Trigger('.search_result');

			/*
			 * Configure tooltips
			 *
			 */
			this.tooltips = new LBi.Tooltip('dfn');

			/**
			 * Configure comments
			 *
			 */
			$('.comment-form').userComments({
				details: '.comment-details'
			});

			/**
			 * split lists
			 *
			 */
			$('.splitted').splittedLists({
				template: '<div class="column_wrapper"></div>',
                replacedClass: 'split'
            });

            $('.splittedmostpopular').splittedLists({
                template: '<div style="width:50%; display:inline-block; vertical-align:top"></div>',
                replacedClass: 'split'
            });

			/*
			 * Configure Equalizers
			 *
			 */
			$(window).bind('load', function() {
				new LBi.Equalize('.equalize');
			});

		}
	};


	$(function() {
		AFS.initialize();
	});

	return AFS;

})(jQuery);

AFS.Sitestat = {
	setURL:function(url) {
		this.sitestatURL = url;
	},
	pageView:function(tag) {
		if(!this.sitestatURL) {
			throw Error('A pixel URL must be defined using setURL() before pageView() can be called.');
		} else {
			var ns_l = this.sitestatURL + '?' + tag;
			this.count(ns_l);
		}
	},
	count: function sitestat(ns_l){
		ns_l+='&amp;ns__t='+(new Date()).getTime();ns_pixelUrl=ns_l;
		ns_0=document.referrer;
		ns_0=(ns_0.lastIndexOf('/')==ns_0.length-1)?ns_0.substring(ns_0.lastIndexOf('/'),0):ns_0;
		if(ns_0.length>0)ns_l+='&amp;ns_referrer='+escape(ns_0);
		if(document.images){ns_1=new Image();ns_1.src=ns_l;}else
		document.write('<img src="'+ns_l+'" width="1" height="1" alt="">');
	}
};

	// flash hook, needs a global function
	window.sitestatPageView = function(tag) {
		AFS.Sitestat.pageView(tag);
	}
