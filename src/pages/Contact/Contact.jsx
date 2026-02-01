import { useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import styles from "./Contact.module.css";
import { useAuthStore } from "../../store/authStore";
import BreadCrumb from "../../components/Breadcrumb/Breadcrumb";
import toast from "react-hot-toast";

const Contact = () => {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.target;

    const data = new FormData(form);
    const response = await fetch("https://formspree.io/f/mgergzpp", {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      toast.success("Mensaje enviado exitosamente");
      form.reset();
    } else {
      toast.error("Error al enviar el mensaje. Intente de nuevo.");
    }
    setIsSubmitting(false);
  };

  return (
    <>      
      <Title1 text="Contacto" type="contacto" />
      {user && <BreadCrumb />}
      <main className={styles.pageMaincontent}>
        <form onSubmit={handleSubmit} className={styles.contactForm}>
          <p className={styles.instructionText}>
            Envíenos su consulta y nuestro equipo técnico le responderá a la brevedad.
          </p>
          
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="ejemplo@correo.com"
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Su nombre completo"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message" className={styles.label}>Mensaje</label>
            <textarea
              id="message"
              name="message"
              placeholder="Escriba el motivo de su consulta aquí..."
              rows="5"
              required
              className={styles.textarea}
            ></textarea>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </form>
      </main>
    </>
  );
};

export default Contact;