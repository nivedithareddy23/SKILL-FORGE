
DO $$
DECLARE
  seed_instructor_id uuid := '9558db21-89fd-4f5e-bf04-2512ef17c925';
  course1_id uuid := gen_random_uuid();
  course2_id uuid := gen_random_uuid();
  course3_id uuid := gen_random_uuid();
  course4_id uuid := gen_random_uuid();
  course5_id uuid := gen_random_uuid();
  course6_id uuid := gen_random_uuid();
  quiz1_id uuid := gen_random_uuid();
  quiz2_id uuid := gen_random_uuid();
  quiz3_id uuid := gen_random_uuid();
  quiz4_id uuid := gen_random_uuid();
  quiz5_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.courses (id, title, description, instructor_id, difficulty_level) VALUES
    (course1_id, 'Python Programming', 'Learn Python from beginner to advanced with practical projects.', seed_instructor_id, 'beginner'),
    (course2_id, 'Java Programming', 'Master Java programming and object-oriented concepts.', seed_instructor_id, 'intermediate'),
    (course3_id, 'Data Structures & Algorithms', 'Improve problem solving and coding interview skills.', seed_instructor_id, 'advanced'),
    (course4_id, 'MySQL Database', 'Learn SQL queries, joins, and relational database design.', seed_instructor_id, 'beginner'),
    (course5_id, 'Frontend Development', 'HTML, CSS, JavaScript, and React development.', seed_instructor_id, 'intermediate'),
    (course6_id, 'Backend Development', 'Node.js, APIs, authentication, and database integration.', seed_instructor_id, 'advanced');

  INSERT INTO public.quizzes (id, course_id, title, difficulty_level, is_published, time_limit_minutes, generated_by_ai) VALUES
    (quiz1_id, course1_id, 'Python Basics Quiz', 'beginner', true, 15, false),
    (quiz2_id, course2_id, 'OOP Concepts Quiz', 'intermediate', true, 20, false),
    (quiz3_id, course3_id, 'Arrays and Strings Quiz', 'advanced', true, 25, false),
    (quiz4_id, course4_id, 'SQL Queries Quiz', 'beginner', true, 15, false),
    (quiz5_id, course5_id, 'HTML & CSS Quiz', 'intermediate', true, 20, false);

  INSERT INTO public.questions (quiz_id, question_text, options, correct_answer, sort_order) VALUES
    (quiz1_id, 'What is the output of print(2 ** 3)?', '["4", "6", "8", "9"]', '8', 1),
    (quiz1_id, 'Which keyword defines a function in Python?', '["func", "define", "def", "function"]', 'def', 2),
    (quiz1_id, 'What data type is type(3.14)?', '["int", "float", "str", "double"]', 'float', 3),
    (quiz1_id, 'Which is a mutable data type?', '["tuple", "string", "list", "int"]', 'list', 4),
    (quiz1_id, 'What does len([1,2,3]) return?', '["1", "2", "3", "4"]', '3', 5),
    (quiz1_id, 'How to start a comment in Python?', '["//", "/*", "#", "<!--"]', '#', 6),
    (quiz1_id, 'File extension for Python?', '[".python", ".py", ".pt", ".pyt"]', '.py', 7),
    (quiz1_id, 'Operator for floor division?', '["/", "//", "%", "**"]', '//', 8),
    (quiz1_id, 'What does range(5) return?', '["[0,1,2,3,4]", "[1,2,3,4,5]", "[0,1,2,3,4,5]", "[1,2,3,4]"]', '[0,1,2,3,4]', 9),
    (quiz1_id, 'Method to add element to list end?', '["add()", "insert()", "append()", "push()"]', 'append()', 10),
    (quiz2_id, 'What does OOP stand for?', '["Object Oriented Programming", "Object Order Programming", "Open Object Programming", "Oriented Object Process"]', 'Object Oriented Programming', 1),
    (quiz2_id, 'Keyword to create object in Java?', '["create", "object", "new", "make"]', 'new', 2),
    (quiz2_id, 'What is encapsulation?', '["Hiding details", "Inheriting", "Overloading", "None"]', 'Hiding details', 3),
    (quiz2_id, 'NOT a pillar of OOP?', '["Inheritance", "Compilation", "Polymorphism", "Abstraction"]', 'Compilation', 4),
    (quiz2_id, 'What is polymorphism?', '["Multiple forms", "Single form", "No form", "Data hiding"]', 'Multiple forms', 5),
    (quiz2_id, 'Most restrictive modifier?', '["public", "protected", "private", "default"]', 'private', 6),
    (quiz2_id, 'What is a constructor?', '["Destroys objects", "Initializes objects", "Variable type", "Class type"]', 'Initializes objects', 7),
    (quiz2_id, 'Java multiple inheritance?', '["Yes", "No", "Interfaces only", "Abstract only"]', 'No', 8),
    (quiz2_id, 'Keyword for inheritance?', '["inherits", "extends", "implements", "super"]', 'extends', 9),
    (quiz2_id, 'Abstract class is?', '["Cannot instantiate", "Final", "Static", "Private"]', 'Cannot instantiate', 10),
    (quiz2_id, 'Garbage collection method?', '["finalize()", "delete()", "destroy()", "remove()"]', 'finalize()', 11),
    (quiz2_id, 'Method overloading is?', '["Same name, diff params", "Same name, same params", "Different methods", "None"]', 'Same name, diff params', 12),
    (quiz3_id, 'Array access time complexity?', '["O(1)", "O(n)", "O(log n)", "O(n²)"]', 'O(1)', 1),
    (quiz3_id, 'Default int array value in Java?', '["null", "0", "undefined", "-1"]', '0', 2),
    (quiz3_id, 'LIFO structure?', '["Queue", "Stack", "Array", "LinkedList"]', 'Stack', 3),
    (quiz3_id, 'Binary search complexity?', '["O(n)", "O(1)", "O(log n)", "O(n²)"]', 'O(log n)', 4),
    (quiz3_id, 'Java strings are?', '["Mutable", "Immutable", "Primitive", "None"]', 'Immutable', 5),
    (quiz3_id, 'Reverse string in Python?', '["reverse()", "[::-1]", "flip()", "rev()"]', '[::-1]', 6),
    (quiz3_id, '2D array is?', '["Array of arrays", "Single array", "Linked list", "Hash map"]', 'Array of arrays', 7),
    (quiz3_id, 'O(n²) worst case sort?', '["Merge", "Quick", "Bubble", "Heap"]', 'Bubble', 8),
    (quiz3_id, 'Merge sort space?', '["O(1)", "O(n)", "O(log n)", "O(n²)"]', 'O(n)', 9),
    (quiz3_id, 'Best for duplicates?', '["Array", "Stack", "HashSet", "Queue"]', 'HashSet', 10),
    (quiz3_id, 'Anagram is?', '["Rearranged chars", "Same string", "Substring", "Palindrome"]', 'Rearranged chars', 11),
    (quiz3_id, 'BFS uses?', '["Stack", "Queue", "Array", "Tree"]', 'Queue', 12),
    (quiz3_id, 'Linear search worst case?', '["O(1)", "O(log n)", "O(n)", "O(n²)"]', 'O(n)', 13),
    (quiz3_id, 'Sliding window for?', '["Sorting", "Subarray problems", "Graphs", "Trees"]', 'Subarray problems', 14),
    (quiz3_id, 'KMP is for?', '["Sorting", "String matching", "Graph search", "Hashing"]', 'String matching', 15),
    (quiz4_id, 'Filter clause?', '["ORDER BY", "GROUP BY", "WHERE", "HAVING"]', 'WHERE', 1),
    (quiz4_id, 'SELECT DISTINCT does?', '["All rows", "Remove duplicates", "Sort", "Group"]', 'Remove duplicates', 2),
    (quiz4_id, 'All rows from both tables?', '["INNER", "LEFT", "FULL OUTER", "CROSS"]', 'FULL OUTER', 3),
    (quiz4_id, 'PRIMARY KEY is?', '["Foreign ref", "Unique ID", "Nullable", "Index"]', 'Unique ID', 4),
    (quiz4_id, 'Count rows function?', '["SUM()", "AVG()", "COUNT()", "MAX()"]', 'COUNT()', 5),
    (quiz4_id, 'DROP TABLE does?', '["Delete rows", "Delete table", "Update", "Backup"]', 'Delete table', 6),
    (quiz4_id, 'Sort clause?', '["WHERE", "GROUP BY", "ORDER BY", "HAVING"]', 'ORDER BY', 7),
    (quiz4_id, 'FOREIGN KEY is?', '["Primary", "Ref to table", "Unique", "Index"]', 'Ref to table', 8),
    (quiz4_id, 'Insert data keyword?', '["ADD", "INSERT INTO", "PUT", "CREATE"]', 'INSERT INTO', 9),
    (quiz4_id, 'NULL means?', '["Zero", "Empty", "Unknown value", "False"]', 'Unknown value', 10),
    (quiz5_id, 'HTML stands for?', '["Hyper Text Markup Language", "High Tech Language", "Hyper Transfer Language", "None"]', 'Hyper Text Markup Language', 1),
    (quiz5_id, 'Largest heading tag?', '["<h6>", "<heading>", "<h1>", "<head>"]', '<h1>', 2),
    (quiz5_id, 'CSS text color property?', '["font-color", "text-color", "color", "foreground"]', 'color', 3),
    (quiz5_id, 'Spacing between elements?', '["padding", "margin", "spacing", "gap"]', 'margin', 4),
    (quiz5_id, 'Correct CSS syntax?', '["body:color=black", "body {color: black;}", "{body;color:black}", "body=color:black"]', 'body {color: black;}', 5),
    (quiz5_id, 'HTML link element?', '["<link>", "<a>", "<href>", "<url>"]', '<a>', 6),
    (quiz5_id, 'CSS stands for?', '["Cascading Style Sheets", "Creative Style System", "Computer Sheets", "Colorful Sheets"]', 'Cascading Style Sheets', 7),
    (quiz5_id, 'Bold text property?', '["font-style", "text-decoration", "font-weight", "text-transform"]', 'font-weight', 8),
    (quiz5_id, 'Flexbox used for?', '["Database", "Layout", "Animation", "Colors"]', 'Layout', 9),
    (quiz5_id, 'Viewport width unit?', '["px", "em", "vw", "rem"]', 'vw', 10),
    (quiz5_id, 'Default div display?', '["inline", "block", "flex", "grid"]', 'block', 11),
    (quiz5_id, 'Hover pseudo-class?', '[":active", ":focus", ":hover", ":visited"]', ':hover', 12);
END $$;
