import Head from "next/head";
import styles from './styles.module.css';
import { GetServerSideProps } from "next";
import {db} from '../../services/firebaseConnection';
import {doc, collection, query, where, getDoc, addDoc, getDocs, deleteDoc} from 'firebase/firestore'
import TextArea from "@/components/textarea";
import { useSession } from "next-auth/react";
import { ChangeEvent, FormEvent, use, useState } from "react";
import { FaTrash } from 'react-icons/fa';

interface tasksProps{
  item: {
    taskId: string,
    tarefa: string,
    created: string,
    public: boolean,
    user: string,
  };
  allComments: CommentsProps [];
}

export default function Task({item, allComments}: tasksProps) {
  const {data: session} = useSession();
  const [input, setInput] = useState('');
  const [comments, setComments] = useState<CommentsProps[]>(allComments || [])

  async function handleComment(event : FormEvent) {
    event.preventDefault();
    if(input === '') return;
    if(!session?.user?.email || !session?.user?.name) return;
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        comment:input,
        created: new Date(),
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item.taskId,
      });
      const data  = {
        id: docRef.id,
        comment: input,
        user: session?.user?.email,
        name: session?.user?.name,
        taskId: item?.taskId,
      }
      setComments((olditems)=> [...olditems, data])
      setInput('');

    } catch (error) {
      console.error(error);
    }
  }

  async function handleDeleteComments(id: string) {
    try {
      const docRef = doc(db, "comments", id);
      await deleteDoc(docRef);
      const deleteComment = comments.filter((comment)=> comment.id !== id);
      setComments(deleteComment);
      alert('Mensagem Deletada!');
    } catch (error) {
      console.error(error);
    }
  }
  return(
    <div className={styles.container}>
      <Head>
       <title>Detalhes da Tarefas</title>
      </Head>
      <main className={styles.main}>
        <h1>Detalhes da Tarefa</h1>
        <article className={styles.task}>
          <p>{item.tarefa}</p>
        </article>

        <section className={styles.commentsContainer}>
          <h2>Deixar Comentários</h2>
          <form onSubmit={handleComment}>
            <TextArea 
              onChange={({target} : ChangeEvent<HTMLTextAreaElement>)=> {
                setInput(target.value);
              }}
              placeholder="Deixe seu comentário..."
              value={input}
            
            />
            <button 
              type="submit"
              className={styles.button}
              disabled= {!session?.user }
            >Comentar</button>
          </form>
        </section>
        <section className={styles.commentsContainer}>
          <h2>Todos os Comentários</h2>
          {comments.length  === 0 && (
            <span>Nenhum Comentário foi encontrado</span>       
          )}
          {
            comments.map((item)=> (
              <article key={item.id} className={styles.comment}>
                <div className={styles.headComment}>
                  <label className={styles.commentsLabel}>{item.name}</label>
                  {item.user === session?.user?.email && (
                    <button 
                      className={styles.buttonTrash}
                      onClick={()=> handleDeleteComments(item.id)}
                    >
                    <FaTrash size={18} color="#EA3140"/>
                  </button>
                  )}
                </div>
                <p>{item.comment}</p>
              </article>
            ))
          }
        </section>
      </main>

    </div>
  );
}

function redirectHome() {
    return {
      redirect: {
            destination: '/',
            permanent:false,
      }
    }
  }

interface CommentsProps {
  id: string,
  comment: string,
  taskId: string,
  user: string,
  name: string,
}
export const getServerSideProps: GetServerSideProps =async ({params}) => {
  const id = params?.id  as string;
  const docRef = doc(db, "tarefas", id);

  const q = query(collection(db, "comments"), where("taskId", "==", id));
  const snapshoptComments = await getDocs(q);

  let allComments: CommentsProps[] = [];
  snapshoptComments.forEach((doc)=> {
    allComments.push({
      id: doc.id,
      comment: doc.data().comment,
      user: doc.data().user,
      name: doc.data().name,
      taskId: doc.data().taskId,
    });
  })

  const snapshot = await getDoc(docRef);
  if(!snapshot.data()) redirectHome();
  if(!snapshot.data()?.public) redirectHome();

  const miliseconds = snapshot.data()?.created?.seconds * 1000;

  const tasks = {
    taskId: id,
    tarefa: snapshot.data()?.tarefa,
    public: snapshot.data()?.public,
    created: new Date(miliseconds).toLocaleDateString(),
    user: snapshot.data()?.user,
  }
  return {
    props: {
      item: tasks,
      allComments
    }
  }
}