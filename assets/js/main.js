const contactForm = document.querySelector("#contact-form");

if (contactForm) {
  const status = contactForm.querySelector("#contact-status");
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const namePattern = /^[\p{L}][\p{L}\s'-]{1,49}$/u;

  const fields = {
    name: {
      input: contactForm.elements.namedItem("name"),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return "Le prénom est obligatoire.";
        }

        if (!namePattern.test(trimmedValue)) {
          return "Le prénom doit contenir au moins 2 lettres.";
        }

        return "";
      },
    },
    surname: {
      input: contactForm.elements.namedItem("surname"),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return "Le nom est obligatoire.";
        }

        if (!namePattern.test(trimmedValue)) {
          return "Le nom doit contenir au moins 2 lettres.";
        }

        return "";
      },
    },
    email: {
      input: contactForm.elements.namedItem("email"),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return "L'email est obligatoire.";
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
          return "Saisissez une adresse email valide.";
        }

        return "";
      },
    },
    message: {
      input: contactForm.elements.namedItem("message"),
      validate(value) {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
          return "Le message est obligatoire.";
        }

        if (trimmedValue.length < 20) {
          return "Le message doit contenir au moins 20 caractères.";
        }

        return "";
      },
    },
  };

  const setStatus = (message, state = "") => {
    if (!status) {
      return;
    }

    status.textContent = message;
    status.dataset.state = state;
  };

  const clearFormErrors = () => {
    Object.keys(fields).forEach((fieldName) => {
      setFieldError(fieldName, "");
    });
  };

  const setFieldError = (fieldName, message) => {
    const field = fields[fieldName];
    const errorNode = contactForm.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !errorNode) {
      return;
    }

    field.input.setAttribute("aria-invalid", message ? "true" : "false");
    errorNode.textContent = message;
  };

  const validateField = (fieldName) => {
    const field = fields[fieldName];

    if (!field) {
      return true;
    }

    const message = field.validate(field.input.value);
    setFieldError(fieldName, message);
    return !message;
  };

  const validateForm = () => Object.keys(fields).every(validateField);

  Object.entries(fields).forEach(([fieldName, field]) => {
    field.input.addEventListener("blur", () => {
      validateField(fieldName);
    });

    field.input.addEventListener("input", () => {
      if (field.input.getAttribute("aria-invalid") === "true") {
        validateField(fieldName);
      }

      if (status?.textContent) {
        setStatus("");
      }
    });
  });

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const isValid = validateForm();

    if (!isValid) {
      setStatus("Merci de corriger les champs signalés avant l'envoi.", "error");

      const firstInvalidField = Object.values(fields).find(
        (field) => field.input.getAttribute("aria-invalid") === "true",
      );

      firstInvalidField?.input.focus();
      return;
    }

    const formData = new FormData(contactForm);
    const firstName = fields.name.input.value.trim();
    const lastName = fields.surname.input.value.trim();
    const fullName = `${firstName} ${lastName}`.trim();

    if (fullName) {
      formData.set("from_name", fullName);
    }

    if (submitButton) {
      submitButton.disabled = true;
    }

    setStatus("Envoi en cours...", "");

    fetch(contactForm.action, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })
      .then(async (response) => {
        let result = null;

        try {
          result = await response.json();
        } catch {
          result = null;
        }

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "L'envoi a échoué.");
        }

        contactForm.reset();
        clearFormErrors();
        setStatus("Message envoyé avec succès.", "success");
      })
      .catch((error) => {
        setStatus(
          error.message || "Impossible d'envoyer le formulaire pour le moment.",
          "error",
        );
      })
      .finally(() => {
        if (submitButton) {
          submitButton.disabled = false;
        }
      });
  });
}
