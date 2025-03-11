export const processData = (examData) => {
  // Convert newlines to <br /> tags
  examData = examData.replace(/\\n/g, "<br />");

  
  // Convert bold markdown (**dd**) to <b> tag
  examData = examData.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");

  // Convert italic markdown ($text$) to <i> tag
  examData = examData.replace(/\$(.*?)\$/g, "<i>$1</i>");

  // Convert tilde markdown (~text~) to <u> tag for underline
  examData = examData.replace(/~(.*?)~/g, "<u>$1</u>");

  return examData;
};
