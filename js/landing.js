(function($, global) {

	/* Load the iframe later, its low priority */
	setTimeout(setIframe, 2500);
	function setIframe() {
		$("#ideasrow").html('<iframe src="http://createchusf.uservoice.com/forums/177021-general" class="" style="height: 700px; width: 98%;"><a href="http://createchusf.uservoice.com/forums/177021-general" class="button" target="_blank">View the ideas</a></iframe>');
	}

	/* Mailchimp Form */
	var signup = {

		// open and set up mailchimp form
		init: function() {

			var _this = this;
			this.hero1 = $("#hero1");
			this.hero2 = $("#hero2");
			_this.hero3 = $("#hero3");

			helpers.autoClearInput($("input.first"));
			helpers.autoClearInput($("input.last"));
			helpers.autoClearInput($("input.email"));
			helpers.autoClearInput($("input.phone"));
			helpers.autoClearInput($("input.website"));

			// bind events
			$(".signup.button").on("click", function() {

				skill = $(this).data("value");

				// set the skill value
				$("input.skill").val(skill);

				$(".signup.button").addClass("inactive");

				// prevent height from dropping
				_this.hero2.height( Math.max(_this.hero1.height(), _this.hero2.height) );

				_this.hero1.fadeOut(500, function() {

					_this.hero2.fadeIn(500, function() {
						$("input.autofocus").focus().select();
					});
				});

				_gaq.push(['_trackEvent', 'Signup', 'Button Clicked', skill]);

			});


			$('#signup-form').isHappy({
				submitButton: '#signup-form .submit',
				submitCallback: function() {
					$.ajax({
						type: 'POST',
						url: 'subscribe.php',
						data: $("#signup-form").serialize(),
						success: function(data) {
							data = JSON.parse(data);
							_gaq.push(['_trackEvent', 'Signup', 'Form Result', skill]);
							if (data.result === "success") {
								_this.hero2.fadeOut(500, function() {
									_this.hero3.fadeIn(500, function() {
										if (data.status === "waitlist") {
											_gaq.push(['_trackEvent', 'Signup', 'Waitlisted', skill]);
											var statusmsg = "waitlist.";
										}
										else {
											_gaq.push(['_trackEvent', 'Signup', 'Registered', skill]);
											var statusmsg = "attendees list.";
										}
										$.cookie('completed_signup', 'true', { expires: 360 });
										$("#signup-message").text("You have been placed on the " + statusmsg)
									});
								});
							}
							else {
								helpers.showAjaxError($("#signup-form"), "There was an error, try again", error.responseText.message);
								_gaq.push(['_trackEvent', 'Signup', 'Error - Server JSON', skill]);
							}
						},
						error: function(error) {
							console.log(error);
							helpers.showAjaxError($("#signup-form"), "There was an error, try again", error.responseText.message);
							_gaq.push(['_trackEvent', 'Signup', 'Error - Server 500', skill]);
						}
					});
				},
				fields: {
					'#signup-form .email': {
						required: true,
						test: function(val) {
							return (/^(?:\w+\.?)*\w+@(?:\w+\.)+\w+$/).test(val);
						},
						message: 'Invalid email'
					},
					'#signup-form .first': {
						required: true
					},
					'#signup-form .last': {
						required: true
					},
					'#signup-form .phone': {
						required: true,
						test: function(val) {
							return (/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).test(val);
						}
					},
					'#signup-form .website': {
						required: false
					}
				},
				when: 'paste blur input' // propertychange input paste blur focus
			});

		}

	};

	/* helpers */

	// some miscellaneous helpers used internally
	var helpers = {

		// empty input when value is default
		autoClearInput : function ($selector) {

			var defaultVal = $selector.attr("default");
			$selector.val(defaultVal);

			$selector.on("click", function() {
				var val = $(this).val();
				if (val === defaultVal) {
					$(this).select();
				}
			});
			$selector.on("blur", function() {
				var val = $(this).val();
				if (val === "") {
					$(this).val(defaultVal);
				}
			});

		},

		// display error message beneath input
		showAjaxError : function ($form, message) {
			var errorDetails = arguments[2] || undefined;
			if (errorDetails) {
				message = errorDetails;
			}
			$form.find(".error-message").empty().html(message);
		},

		// transition to new content
		toggleElements : function ($section1, $section2) {
			$section1.fadeOut(500, function() {
				$section2.fadeIn(1000);
			});
		}
	};

	if ($.cookie('completed_signup') !== 'true')
		signup.init();
	else {
		$(".signup.button").addClass("inactive");
	}

})(jQuery, window);
