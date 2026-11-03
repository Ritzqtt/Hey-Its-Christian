
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

import facebookIcon from "../assets/icons/facebook.png";
import xIcon from "../assets/icons/x.png";
import githubIcon from "../assets/icons/github.png";
import linkedinIcon from "../assets/icons/linkedin.png";
import jobstreetIcon from "../assets/icons/jobstreet.png";

const CONTACT_EMAIL = "cobarcoma@gmail.com";
const MAX_MESSAGE_LENGTH = 1000;
const SUBMIT_INTERVAL = 30_000;

const socialLinks = [
  { name: "GitHub", icon: githubIcon, url: "https://github.com/Ritzqtt" },
  {
    name: "LinkedIn",
    icon: linkedinIcon,
    url: "https://www.linkedin.com/in/cobarcoma",
  },
  {
    name: "JobStreet",
    icon: jobstreetIcon,
    url: "https://ph.jobstreet.com/profiles/christian-barcoma-cbkkwcncfv",
  },
  {
    name: "Facebook",
    icon: facebookIcon,
    url: "https://www.facebook.com/christian.olbes.18",
  },
  {
    name: "Instagram",
    icon: "instagram",
    url: "https://www.instagram.com/ritzqt_/",
  },
  { name: "X", icon: xIcon, url: "https://x.com/kwiishii" },
  {
    name: "TikTok",
    icon: "tiktok",
    url: "https://www.tiktok.com/@ritzqtt",
  },
];

const initialValues = {
  name: "",
  email: "",
  message: "",
  botcheck: false,
};

function validate(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.message.trim().length < 10) {
    errors.message = "Your message must be at least 10 characters.";
  }

  if (values.message.length > MAX_MESSAGE_LENGTH) {
    errors.message = `Your message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`;
  }

  return errors;
}

function Contact() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [status, setStatus] = useState("idle");
  const [requestError, setRequestError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  const sendingRef = useRef(false);
  const lastSuccessfulSubmitRef = useRef(0);
  const copyTimerRef = useRef(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current !== null) {
        window.clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    const updatedValues = {
      ...values,
      [name]: type === "checkbox" ? checked : value,
    };

    setValues(updatedValues);

    if (attemptedSubmit) {
      setErrors(validate(updatedValues));
    }
  };

  const validateOnBlur = () => {
    if (attemptedSubmit) {
      setErrors(validate(values));
    }
  };

  // SUPABASE CONTACT FORM SUBMISSION
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (sendingRef.current) return;

    setAttemptedSubmit(true);

    const nextErrors = validate(values);
    setErrors(nextErrors);

    const firstInvalid = ["name", "email", "message"].find(
      (field) => nextErrors[field]
    );

    if (firstInvalid) {
      const fieldRefs = {
        name: nameRef,
        email: emailRef,
        message: messageRef,
      };

      fieldRefs[firstInvalid].current?.focus();
      return;
    }

    // Prevent repeated submissions
    if (
      Date.now() - lastSuccessfulSubmitRef.current <
      SUBMIT_INTERVAL
    ) {
      setRequestError(
        "Please wait 30 seconds before sending another message."
      );
      setStatus("error");
      return;
    }

    // Honeypot spam protection
    if (values.botcheck) {
      return;
    }

    sendingRef.current = true;
    setStatus("sending");
    setRequestError("");

    try {
      const { data, error } = await supabase.functions.invoke(
        "send-contact-email",
        {
          body: {
            name: values.name.trim(),
            email: values.email.trim(),
            subject: `New message from your portfolio: ${values.name.trim()}`,
            message: values.message.trim(),
            website: "",
          },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.ignored === true) {
        setStatus("idle");
        return;
      }

      if (!data?.success) {
        throw new Error(
          data?.error || "Contact form submission failed."
        );
      }

      lastSuccessfulSubmitRef.current = Date.now();

      setValues(initialValues);
      setErrors({});
      setAttemptedSubmit(false);
      setStatus("success");

    } catch (error) {
      let serviceMessage = "";
      const errorResponse = error?.context;

      if (errorResponse instanceof Response) {
        try {
          const errorBody = await errorResponse.clone().json();
          if (typeof errorBody?.error === "string") {
            serviceMessage = errorBody.error;
          }
        } catch {
          serviceMessage = "";
        }
      } else if (
        error instanceof Error &&
        error.message !== "Contact form submission failed."
      ) {
        serviceMessage = error.message;
      }

      if (import.meta.env.DEV) {
        console.error("Contact form error:", error);
      }

      setRequestError(
        serviceMessage
          ? `${serviceMessage} Please email me directly at ${CONTACT_EMAIL}.`
          : `Something went wrong. Please try again or email me directly at ${CONTACT_EMAIL}.`
      );

      setStatus("error");

    } finally {
      sendingRef.current = false;
    }
  };

  // COPY EMAIL ADDRESS
  const copyEmail = async () => {
    let copySucceeded;

    const copyWithFallback = () => {
      const emailInput = document.createElement("textarea");

      emailInput.value = CONTACT_EMAIL;
      emailInput.setAttribute("readonly", "");
      emailInput.style.position = "fixed";
      emailInput.style.opacity = "0";

      document.body.appendChild(emailInput);
      emailInput.select();

      const succeeded = document.execCommand("copy");

      emailInput.remove();

      return succeeded;
    };

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(CONTACT_EMAIL);
        copySucceeded = true;
      } catch {
        copySucceeded = copyWithFallback();
      }
    } else {
      copySucceeded = copyWithFallback();
    }

    setCopyFeedback(copySucceeded ? "Copied!" : "Copy failed");

    if (copyTimerRef.current !== null) {
      window.clearTimeout(copyTimerRef.current);
    }

    copyTimerRef.current = window.setTimeout(() => {
      setCopyFeedback("");
      copyTimerRef.current = null;
    }, 1800);
  };

  // SEND ANOTHER MESSAGE
  const sendAnotherMessage = () => {
    setStatus("idle");
    setRequestError("");
    setValues(initialValues);
    setErrors({});
    setAttemptedSubmit(false);
  };

  return (
    <section id="contact" className="page-section alternate-section">
      <div className="section-container">
        <p className="section-label">LET'S CONNECT</p>

        <h2>Contact Me</h2>

        <div className="section-line" />

        <p className="section-intro">
          Have a project idea, collaboration opportunity,
          or just want to connect? Feel free to reach out!
        </p>

        <div className="contact-layout">
          <div className="contact-card">
            {status === "success" ? (
              <div
                className="contact-success"
                role="status"
                aria-live="polite"
              >
                <span
                  className="contact-success-check"
                  aria-hidden="true"
                >
                  ✓
                </span>

                <h3>Message sent!</h3>

                <p>Thank you, I'll reply soon.</p>

                <button
                  type="button"
                  className="contact-secondary-button"
                  onClick={sendAnotherMessage}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h3>Send me a message</h3>

                <p className="contact-card-intro">
                  I'll get back to you as soon as I can.
                </p>

                <form noValidate onSubmit={handleSubmit}>
                  {/* Honeypot spam protection */}
                  <div
                    className="contact-honeypot"
                    aria-hidden="true"
                  >
                    <label htmlFor="contact-botcheck">
                      Leave this unchecked
                    </label>

                    <input
                      id="contact-botcheck"
                      name="botcheck"
                      type="checkbox"
                      autoComplete="off"
                      tabIndex={-1}
                      checked={values.botcheck}
                      onChange={updateField}
                    />
                  </div>

                  {/* NAME */}
                  <div className="contact-field">
                    <label htmlFor="contact-name">Name</label>

                    <input
                      ref={nameRef}
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={values.name}
                      onChange={updateField}
                      onBlur={validateOnBlur}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={
                        errors.name
                          ? "contact-name-error"
                          : undefined
                      }
                    />

                    {errors.name && (
                      <span
                        className="contact-field-error"
                        id="contact-name-error"
                      >
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* EMAIL */}
                  <div className="contact-field">
                    <label htmlFor="contact-email">Email</label>

                    <input
                      ref={emailRef}
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={values.email}
                      onChange={updateField}
                      onBlur={validateOnBlur}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={
                        errors.email
                          ? "contact-email-error"
                          : undefined
                      }
                    />

                    {errors.email && (
                      <span
                        className="contact-field-error"
                        id="contact-email-error"
                      >
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* MESSAGE */}
                  <div className="contact-field">
                    <label htmlFor="contact-message">Message</label>

                    <textarea
                      ref={messageRef}
                      id="contact-message"
                      name="message"
                      rows={5}
                      maxLength={MAX_MESSAGE_LENGTH}
                      value={values.message}
                      onChange={updateField}
                      onBlur={validateOnBlur}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={[
                        errors.message
                          ? "contact-message-error"
                          : "",
                        "contact-message-count",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />

                    <div className="contact-message-meta">
                      {errors.message && (
                        <span
                          className="contact-field-error"
                          id="contact-message-error"
                        >
                          {errors.message}
                        </span>
                      )}

                      <span
                        id="contact-message-count"
                        aria-live="polite"
                      >
                        {values.message.length}/{MAX_MESSAGE_LENGTH}
                      </span>
                    </div>
                  </div>

                  {/* ERROR MESSAGE */}
                  {requestError && (
                    <p
                      className="contact-request-error"
                      role="alert"
                    >
                      {requestError}
                    </p>
                  )}

                  {/* SUBMIT BUTTON */}
                  <button
                    className="contact-submit-button"
                    type="submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? (
                      <>
                        <span
                          className="contact-spinner"
                          aria-hidden="true"
                        />
                        Sending...
                      </>
                    ) : (
                      "Send message"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* SOCIAL MEDIA PANEL */}
          <aside className="contact-social-panel">
            <h3>Find me online</h3>

            <p className="contact-card-intro">
              You can also reach me through email or connect on social media.
            </p>

            <div className="contact-email-row">
              <svg
                className="contact-email-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6.5h16v11H4z"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />

                <path
                  d="m4.5 7 7.5 6 7.5-6"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>

              <a href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>

              <button
                type="button"
                className="contact-copy-button"
                onClick={copyEmail}
                aria-label={
                  copyFeedback === "Copied!"
                    ? "Email address copied"
                    : "Copy email address"
                }
              >
                {copyFeedback || "Copy"}
              </button>
            </div>

            {/* SOCIAL LINKS */}
            <ul className="contact-social-list">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    className="contact-social-link"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${social.name} profile (opens in a new tab)`}
                  >
                    <span className="contact-social-icon">
                      {social.icon === "instagram" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <rect
                            x="3.5"
                            y="3.5"
                            width="17"
                            height="17"
                            rx="5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />

                          <circle
                            cx="12"
                            cy="12"
                            r="4"
                            stroke="currentColor"
                            strokeWidth="1.8"
                          />

                          <circle
                            cx="17.6"
                            cy="6.7"
                            r="1.1"
                            fill="currentColor"
                          />
                        </svg>
                      ) : social.icon === "tiktok" ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M14 3v12.1a4.1 4.1 0 1 1-3.1-4V14a1.5 1.5 0 1 0 1.1 1.4V3h2c.4 2.4 1.9 4.1 4.2 4.8v2.1A8 8 0 0 1 14 8.2"
                            fill="currentColor"
                          />
                        </svg>
                      ) : (
                        <img src={social.icon} alt="" />
                      )}
                    </span>

                    <span>{social.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Contact;