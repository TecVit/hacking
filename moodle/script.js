(async () => { 
let version = "1.0.0";
let author = "Vitor";

const getSessionKey = async ( tryClipboard = true ) => {
  try {
    if (window.M && window.M.cfg && window.M.cfg.sesskey) {
      const s = window.M.cfg.sesskey;
      if (tryClipboard && navigator.clipboard && navigator.clipboard.writeText) {
        try { await navigator.clipboard.writeText(s); } catch(_) {}
      }
      return s;
    }
  } catch (error) {
    alert("Feche a página e tente novamente!");
    console.error(error);
  }
}

const getCourses = async (sessionKey) => {
  try {
    const url = `https://moodle.arq.ifsp.edu.br/lib/ajax/service.php?sesskey=${sessionKey}&info=core_course_get_enrolled_courses_by_timeline_classification`;
    const objBody = [{
      "index": 0,
      "methodname": "core_course_get_enrolled_courses_by_timeline_classification",
      "args": {
        "offset": 0,
        "limit": 0,
        "classification": "all",
        "sort": "fullname",
        "customfieldname": "",
        "customfieldvalue": "",
        "requiredfields": ["id","fullname","shortname","showcoursecategory","showshortname","visible","enddate"]
    }}];

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(objBody),
      credentials: "include"
    });

    const data = await response.json();
    const list = data[0]?.data?.courses;

    return list;
  } catch (error) {
    console.log(error);
  }
}

const getMaterialsOfCourses = async (sessionKey, courses) => {
  try {
    if (!courses || !courses.length) return [];

    const fetchPromises = courses.map(async (course) => {
      try {
        const url = `https://moodle.arq.ifsp.edu.br/lib/ajax/service.php?sesskey=${sessionKey}&info=core_courseformat_get_state`;
        const objBody = [{
          "index": 0,
          "methodname": "core_courseformat_get_state",
          "args": {
            "courseid": course.id,
          }
        }];

        const response = await fetch(url, {
          method: "POST",
          body: JSON.stringify(objBody),
          credentials: 'include'
        });

        const data = await response.json();
        const dataCourse = data[0].data;

        return { ...course, materials: dataCourse };
      } catch (error) {
        console.error(`Erro ao buscar materiais do curso ${course.id}:`, error);
        return { courseId: course.id, materials: [] };
      }
    });

    return fetchPromises;

  } catch (error) {
    console.error(error);
  }
}

const main = async () => {
  try {
    // 1º Passo - Adiquirir o Auth da API
    const sessionKey = await getSessionKey();

    // 2º Passo - Coletar os Cursos
    const courses = await getCourses(sessionKey);
    console.log(courses);

    // 3º Passo - Coletar os Materiais de Cada Curso
    const coursesWithMaterials = await getMaterialsOfCourses(sessionKey, courses);
    console.log(coursesWithMaterials);

    // 4º Passo - Armazenar essas informações

    // 5º Passo - Redirecionar para plataforma

  } catch (error) {
    console.error(error);
  }
}

main();
})();