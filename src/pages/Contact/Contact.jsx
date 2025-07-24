import { useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import styles from "./Contact.module.css";
import { useAuthStore } from "../../store/authStore";
import  BreadCrumb  from "../../components/Breadcrumb/Breadcrumb";
import toast from "react-hot-toast";

const Contact = () => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;

    // Usar la API de Formspree
    const data = new FormData(form);
    const response = await fetch("https://formspree.io/f/mgergzpp", {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json",
      },
    });

    if (response.ok) {
      toast.success("¡Mensaje enviado exitosamente!");
      form.reset();
    } else {
      toast.error("Hubo un error al enviar el mensaje. Inténtelo de nuevo.");
    }

    setIsSubmitting(false);
  };

  return (
    <>      
        <Title1 text="Contacto." type="contacto" />
        {user && <BreadCrumb />}
        <main className={styles.pageMaincontent}>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <p className={styles.loginFormParagraph}>🙋🏻‍♂️ Dejanos un mensaje y te responderemos a la brevedad.</p>
          
          <div className={styles.loginFormInputRow}>
            <label htmlFor="email" className={styles.loginFormLabel}>
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Ingrese su correo electrónico"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.loginFormInputRow}>
            <label htmlFor="name" className={styles.loginFormLabel}>
              Nombre:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ingrese su nombre (opcional)"
              className={styles.input}
            />
          </div>

          <div className={styles.loginFormInputRow}>
            <label htmlFor="message" className={styles.loginFormLabel}>
              Mensaje:
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Escribe tu mensaje aquí"
              rows="5"
              required
              className={styles.textarea}
            ></textarea>
          </div>

          <button className={styles.loginFormBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar"}
          </button>
        </form>
        </main>
    </>
  );
};

export default Contact;
