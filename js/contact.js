$(document).ready(function() {
    const $form = $('.contact-form');
    const $feedback = $('#form-feedback');
    const $submitBtn = $form.find('.btn-submit');
    const originalBtnText = $submitBtn.text();

    $form.on('submit', function(e) {
        e.preventDefault();

        // Basic validation (HTML5 validation usually catches this first, but good as backup)
        if (this.checkValidity() === false) {
            e.stopPropagation();
            return;
        }

        // UI Loading State
        const sendingText = window.i18nManager ? window.i18nManager.getNestedTranslation("contact.form.sending") : "Sending...";
        $submitBtn.prop('disabled', true).text(sendingText);
        $feedback.removeClass('success error').hide();

        // Simulate API call
        setTimeout(function() {
            // Success scenario
            const successText = window.i18nManager ? window.i18nManager.getNestedTranslation("contact.form.success") : "Thank you! Your message has been sent successfully. I will get back to you soon.";
            $feedback
                .addClass('success')
                .text(successText)
                .fadeIn();
            
            $form[0].reset();
            $submitBtn.prop('disabled', false).text(originalBtnText);

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                $feedback.fadeOut();
            }, 5000);

        }, 1500); // 1.5s delay
    });
});
