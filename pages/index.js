import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "../styles/Home.module.css";
import Draggable from "react-draggable";

// Initialize Cloud Firestore through Firebase
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDocs,
  collection,
  updateDoc,
  setDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7akJhJJlEnZjVyXe6Jykh4fxDFSVv38E",
  authDomain: "questions-and-answers-14125.firebaseapp.com",
  databaseURL:
    "https://questions-and-answers-14125-default-rtdb.firebaseio.com",
  projectId: "questions-and-answers-14125",
  storageBucket: "questions-and-answers-14125.appspot.com",
  messagingSenderId: "518960628693",
  appId: "1:518960628693:web:4d9d39cf90613eba75f35c",
  measurementId: "G-RYD3CQVPHM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore();

const databaseName = "questions-responses";

export default function Home() {
  // Data being fetched from
  const [question, setQuestion] = useState("");
  const [allQuestions, setAllQuestions] = useState([]);

  const [response, setResponse] = useState("");
  const [askedQuestion, setAskedQuestion] = useState([]);
  const [currDocRef, setCurrDocRef] = useState("");
  const [error, setError] = useState("");

  const [currState, setCurrState] = useState("gallery");

  function makeid(length) {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async function submitResponse() {
    if (response.length === 0) {
      setError("You have to give us some words of wisdom");
      return;
    }
    await updateDoc(currDocRef, {
      response: response,
    });
    setError("");
    setCurrState("gallery");
  }

  async function submitQuestion() {
    const id = makeid(16);
    if (askedQuestion.length === 0) {
      setError("You have to ask a question first!");
      return;
    }

    await setDoc(doc(db, databaseName, id), {
      question: askedQuestion,
      response: "",
    });
    setError("");
    setCurrState("response");
  }

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, databaseName));
      const questions = [];
      querySnapshot.forEach((currDoc) => {
        console.log(currDoc.id, " => ", currDoc.data());
        const data = currDoc.data();
        if (data.response.length == 0) {
          if (question.length == 0) {
            setCurrDocRef(doc(db, databaseName, currDoc.id));
            setQuestion(data.question);
          }
        } else {
          questions.push(data);
        }
      });
      setAllQuestions(questions);
    };

    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Questions and Answers</title>
        <meta name="description" content="ask questions, get answers" />
        <link rel="icon" href="/icon.png" />
      </Head>
      {/* <div onClick={setPage("gallery")}>Gallery</div> */}

      <div className={styles.main}>
        {currState === "" ? (
          <>
            <h1 className={styles.title}>Questions and Answers</h1>
            <p className={styles.subtitle}>
              The world is full of questions that we don't know the answers to.
              It's part of the human condition to solve them. Maybe you could
              take a stab?
            </p>
            <button
              className={[styles.button, styles.mainButton].join(" ")}
              onClick={() => setCurrState("question")}
            >
              Let's Go
            </button>
          </>
        ) : (
          <></>
        )}

        {currState === "question" ? (
          <>
            {" "}
            <h2 className={styles.title}>
              Send a question into the ethersphere
            </h2>
            <textarea
              rows="2"
              cols="30"
              className={[styles.textInput, styles.animation2].join(" ")}
              value={askedQuestion}
              onChange={(e) => setAskedQuestion(e.target.value)}
            ></textarea>
            <button
              className={[styles.button, styles.animation3].join(" ")}
              onClick={submitQuestion}
            >
              Send
            </button>
            {error && <p>{error}</p>}
          </>
        ) : currState === "response" ? (
          <>
            <h2 className={styles.title}>
              The void has brought you the question:
            </h2>
            <p className={styles.animation2} style={{ fontStyle: "italic" }}>
              {question}
            </p>
            <textarea
              rows="2"
              cols="40"
              className={[styles.textInput, styles.animation3].join(" ")}
              value={response}
              placeholder="What do you say?"
              onChange={(e) => {
                setResponse(e.target.value);
              }}
            ></textarea>
            <button
              className={[styles.button, styles.animation4].join(" ")}
              onClick={submitResponse}
            >
              Send
            </button>
            {error && <p>{error}</p>}
          </>
        ) : currState === "gallery" ? (
          <>
            {/* <p>About</p> */}
            <div className={styles.gallery}>
              <div className={styles.galleryTitle}>
                <h2 className={styles.title}>
                  See what others before you have asked and answered
                </h2>
                <h3>(notes are draggable!)</h3>
              </div>
              {allQuestions.map((question, i) => {
                const randomX = Math.random() * ((window.innerWidth * 4) / 5);
                const randomY = Math.random() * window.innerHeight;

                const time = i * 0.5;
                return (
                  <Draggable key={i}>
                    <div
                      className={styles.galleryBox}
                      style={{
                        position: "absolute",
                        top: randomY,
                        left: randomX,
                        animationDelay: `${time}s`,
                      }}
                    >
                      <h3 className={styles.question}>{question.question}</h3>
                      <p className={styles.response}>{question.response}</p>
                    </div>
                  </Draggable>
                );
              })}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
