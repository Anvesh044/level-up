import React from "react";

// 📘 TEXT BOOKS
import osBook from "./books/OS.pdf";
import aiBook from "./books/AI.pdf";
import cleenCodeBook from "./books/CLEEN CODE.pdf";
import cnBook from "./books/CN.pdf";
import coaBook from "./books/COA.pdf";
import daaBook from "./books/DAA.pdf";
import dbmsBook from "./books/DBMS.pdf";
import dsaBook from "./books/DSA.pdf";
import oopsBook from "./books/OOPS.pdf";

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #2a0f3d 0%, #3b1557 45%, #4a1d6f 100%)",
    padding: "48px 28px",
    color: "#f5f3f7",
    fontFamily: `"Inter", system-ui, -apple-system, BlinkMacSystemFont`,
  },

  header: {
    maxWidth: "1200px",
    margin: "0 auto 42px",
  },

  title: {
    fontSize: "2.6rem",
    fontWeight: 600,
    letterSpacing: "-0.5px",
    marginBottom: "6px",
  },

  subtitle: {
    fontSize: "1.05rem",
    color: "#d1c4e9",
  },

  sectionTitle: {
    marginTop: "36px",
    fontSize: "1.4rem",
    fontWeight: 500,
    color: "#ede7f6",
  },

  gridWrapper: {
    maxWidth: "1200px",
    margin: "0 auto",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "26px",
    marginTop: "24px",
  },

  card: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "14px",
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backdropFilter: "blur(12px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },

  cardHover: {
    transform: "translateY(-4px)",
    boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
  },

  bookTitle: {
    fontSize: "1.1rem",
    fontWeight: 500,
    lineHeight: 1.5,
    marginBottom: "18px",
    color: "#f3e8ff",
  },

  btnGroup: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    marginTop: "auto",
  },

  readBtn: {
    flex: 1,
    background: "#ede7f6",
    color: "#2a0f3d",
    border: "none",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
  },

  downloadBtn: {
    flex: 1,
    background: "transparent",
    color: "#ede7f6",
    border: "1px solid rgba(237,231,246,0.4)",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
};

const ELibrary = () => {
  const textBooks = [
    { title: "Operating Systems", file: osBook },
    { title: "Artificial Intelligence", file: aiBook },
    { title: "Clean Code", file: cleenCodeBook },
    { title: "Computer Networks", file: cnBook },
    { title: "Computer Organization & Architecture", file: coaBook },
    { title: "Design & Analysis of Algorithms", file: daaBook },
    { title: "Database Management Systems", file: dbmsBook },
    { title: "Data Structures & Algorithms", file: dsaBook },
    { title: "Object Oriented Programming", file: oopsBook },
  ];

  const renderBook = (book) => (
    <div
      key={book.title}
      style={styles.card}
      onMouseEnter={(e) =>
        Object.assign(e.currentTarget.style, styles.cardHover)
      }
      onMouseLeave={(e) =>
        Object.assign(e.currentTarget.style, {
          transform: "none",
          boxShadow: "none",
        })
      }
    >
      <div style={styles.bookTitle}>{book.title}</div>

      <div style={styles.btnGroup}>
        <a href={book.file} target="_blank" rel="noreferrer">
          <button style={styles.readBtn}>Read</button>
        </a>
        <a href={book.file} download>
          <button style={styles.downloadBtn}>Download</button>
        </a>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>E-Library</h1>
        <p style={styles.subtitle}>
          A focused, distraction-free space for reading and learning.
        </p>
        <h2 style={styles.sectionTitle}>Text Books</h2>
      </div>

      <div style={styles.gridWrapper}>
        <div style={styles.grid}>
          {textBooks.map(renderBook)}
        </div>
      </div>
    </div>
  );
};

export default ELibrary;
