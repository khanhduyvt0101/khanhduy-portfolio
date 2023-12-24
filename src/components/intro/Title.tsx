// import { AnimatePresence } from "framer-motion";
// import { VisuallyHidden } from "./VisuallyHidden";
// import { Transition } from "./Transition";

// export const Title = () => {
//   return (
//     <div>
//       <h1 className={styles.name} data-visible={visible} id={titleId}>
//         KHANH DUY
//       </h1>
//       <div>
//         <VisuallyHidden className={styles.label}>
//           {`Designer + ${introLabel}`}
//         </VisuallyHidden>
//         <span aria-hidden className={styles.row}>
//           <span
//             className={styles.word}
//             data-status={status}
//             style={cssProps({ delay: tokens.base.durationXS })}
//           >
//             Designer
//           </span>
//           <span className={styles.line} data-status={status} />
//         </span>
//         <div className={styles.row} component="span">
//           <AnimatePresence>
//             {disciplines.map((item) => (
//               <Transition
//                 unmount
//                 in={item === currentDiscipline}
//                 timeout={{ enter: 3000, exit: 2000 }}
//                 key={item}
//               >
//                 {(visible, status) => (
//                   <span
//                     aria-hidden
//                     className={styles.word}
//                     data-plus={true}
//                     data-status={status}
//                     style={cssProps({ delay: tokens.base.durationL })}
//                   >
//                     {item}
//                   </span>
//                 )}
//               </Transition>
//             ))}
//           </AnimatePresence>
//         </div>
//       </div>
//     </div>
//   );
// };
