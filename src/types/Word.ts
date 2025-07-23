import Definition from "./Definition";
import Pronunciation from "./Pronunciation";

export default interface Word {
  word: string;
  phonetic: string;
  phonetics: Pronunciation[];
  meanings: Definition[];
}
