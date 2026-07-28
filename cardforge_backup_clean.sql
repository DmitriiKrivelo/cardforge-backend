--
-- PostgreSQL database dump
--

\restrict ZBHJ1lfDYVcmvt8eV6cPWSmznSLzszd1U0dXACBgrNotrAvTywue3PJaOK8SJTP

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: business_cards; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.business_cards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    template_id integer DEFAULT 1,
    is_active boolean DEFAULT true,
    slug character varying(255) NOT NULL,
    data jsonb NOT NULL,
    views integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: business_cards_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.business_cards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: business_cards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.business_cards_id_seq OWNED BY public.business_cards.id;


--
-- Name: card_views; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.card_views (
    id integer NOT NULL,
    card_id integer NOT NULL,
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


--
-- Name: card_views_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.card_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: card_views_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.card_views_id_seq OWNED BY public.card_views.id;


--
-- Name: templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.templates (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    preview_url character varying(255),
    data jsonb NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    layout_type character varying(20) DEFAULT 'vertical'::character varying
);


--
-- Name: templates_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.templates_id_seq OWNED BY public.templates.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    role character varying(20) DEFAULT 'user'::character varying
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: business_cards id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_cards ALTER COLUMN id SET DEFAULT nextval('public.business_cards_id_seq'::regclass);


--
-- Name: card_views id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_views ALTER COLUMN id SET DEFAULT nextval('public.card_views_id_seq'::regclass);


--
-- Name: templates id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates ALTER COLUMN id SET DEFAULT nextval('public.templates_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: business_cards; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.business_cards (id, user_id, title, template_id, is_active, slug, data, views, created_at, updated_at) FROM stdin;
1	1	Моя первая визитка	1	t	-1779303823251	{"name": "Иван Петров", "email": "ivan@example.com", "phone": "+7 123 456-78-90", "company": "CardForge", "website": "cardforge.me", "position": "CEO"}	37	2026-05-20 19:03:43.2643	2026-05-20 19:03:43.2643
2	1	My Card	1	t	my-card-1779304128775	{"name": "Ivan Petrov", "email": "ivan@example.com", "phone": "+7 123 456-78-90", "company": "CardForge", "website": "cardforge.me", "position": "CEO"}	34	2026-05-20 19:08:48.791865	2026-05-20 19:08:48.791865
20	14	Рабочая визитка	1	t	-1781975277172	{"email": "example@gmail.com", "phone": "+7 900 123 45 67", "avatar": "http://localhost:3000/uploads/1781975177326-765914781.webp", "company": "ГК АГРОЭКО", "website": "https://agroeco.ru/", "lastName": "Иванов", "max_link": "https://max.ru/u/f9LHodD0cOLVmy21uKOI6skf35R54t6qkG4JhDpqGhw3Fy9Y6z_ARJvB6es", "position": "Специалист по документообороту", "telegram": "https://t.me/oVoSHeReZka1", "firstName": "Иван", "patronymic": "Иванович"}	10	2026-06-20 17:07:57.187022	2026-06-20 17:07:57.187022
6	1	CEO CardForge	1	t	ceo-cardforge	{"name": "Дмитрий Кривело", "email": "dmitry@cardforge.com", "phone": "+7 999 123-45-67", "company": "CardForge", "website": "https://cardforge.com", "linkedin": "dmitry", "position": "CEO & Founder", "telegram": "@dmitry", "instagram": "dmitry_cardforge"}	86	2026-05-21 17:39:03.365394	2026-05-21 17:39:03.365394
7	3	Маркетолог	1	t	marketing-expert	{"name": "Иван Петров", "email": "ivan@cardforge.com", "phone": "+7 999 234-56-78", "company": "CardForge", "website": "https://cardforge.com", "linkedin": "ivan-petrov", "position": "Head of Marketing", "telegram": "@ivan_p"}	121	2026-05-21 17:39:03.37263	2026-05-21 17:39:03.37263
8	2	Разработчик	1	t	fullstack-dev	{"name": "Елена Смирнова", "email": "elena@cardforge.com", "phone": "+7 999 345-67-89", "avatar": "http://localhost:3000/uploads/1779474860907-948047717.webp", "company": "CardForge", "website": "https://github.com/elena", "linkedin": "elena-smirnova", "position": "Senior Fullstack Developer", "telegram": "@elena_dev"}	60	2026-05-21 17:39:03.375288	2026-05-22 18:34:22.756114
13	2	Вертикальная пример	1	t	ggg-v1-2-1780572235243	{"email": "lamagistro@mail.ru", "phone": "+7 908 149 61 55", "avatar": "http://localhost:3000/uploads/1780572212299-28719738.webp", "lastName": "Krivelo", "max_link": "https://max.ru/u/f9LHodD0cOLVmy21uKOI6skf35R54t6qkG4JhDpqGhw3Fy9Y6z_ARJvB6es", "position": "Стажер", "telegram": "https://t.me/oVoSHeReZka1", "firstName": "Dmitriy", "patronymic": "Andreevich"}	50	2026-06-04 11:23:55.257192	2026-06-09 16:55:59.102858
11	8	Моя тестовая визитка	1	t	-1779509861505	{"name": "Иван Тестов", "email": "ivan@test.com", "phone": "+7 999 111-22-33"}	0	2026-05-23 04:17:41.519313	2026-05-23 04:17:41.519313
16	2	Горизонтальная пример	2	t	ggg-v1-4-1781023408257	{"email": "krivelodmitry@gmail.com", "phone": "+7 908 149 61 55", "avatar": "http://localhost:3000/uploads/1781023405246-245337697.webp", "lastName": "Кривело", "max_link": "https://max.ru/u/f9LHodD0cOLVmy21uKOI6skf35R54t6qkG4JhDpqGhw3Fy9Y6z_ARJvB6es", "position": "Оператор комплекса", "telegram": "https://t.me/oVoSHeReZka1", "firstName": "Дмитрий", "patronymic": "Андреевич"}	22	2026-06-09 16:43:28.272564	2026-06-09 16:55:35.862965
14	2	Краткая пример	3	t	ggg-v1-3-1780956649408	{"email": "krivelodmitry@gmail.com", "phone": "+7 908 149 61 55", "avatar": "http://localhost:3000/uploads/1780956632219-570157829.webp", "lastName": "Кривело", "max_link": "https://max.ru/u/f9LHodD0cOLVmy21uKOI6skf35R54t6qkG4JhDpqGhw3Fy9Y6z_ARJvB6es", "position": "Стажер", "telegram": "https://t.me/oVoSHeReZka1", "firstName": "Дмитрий", "patronymic": "Андреевич"}	34	2026-06-08 22:10:49.423361	2026-06-09 16:55:46.306128
\.


--
-- Data for Name: card_views; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.card_views (id, card_id, viewed_at, user_id) FROM stdin;
1	16	2026-05-27 09:31:46.477	\N
2	16	2026-05-29 13:54:46.477	\N
3	16	2026-06-06 17:46:46.477	\N
4	16	2026-05-22 06:55:46.477	\N
5	16	2026-06-15 21:31:46.477	\N
6	16	2026-06-02 04:27:46.477	\N
7	16	2026-06-16 06:59:46.477	\N
8	16	2026-06-11 14:50:46.477	\N
9	16	2026-06-08 05:29:46.477	\N
10	16	2026-06-14 06:20:46.477	\N
11	16	2026-06-08 23:43:46.477	\N
12	16	2026-06-12 19:43:46.477	\N
13	16	2026-06-04 13:50:46.477	\N
14	16	2026-06-11 20:32:46.477	\N
15	16	2026-06-02 11:14:46.477	\N
16	16	2026-06-11 11:16:46.477	\N
17	16	2026-06-05 04:34:46.477	\N
18	16	2026-06-13 00:32:46.477	\N
19	1	2026-06-06 07:16:46.477	\N
20	1	2026-06-03 22:33:46.477	\N
21	1	2026-05-29 13:59:46.477	\N
22	1	2026-06-01 08:51:46.477	\N
23	1	2026-05-23 13:21:46.477	\N
24	1	2026-06-08 03:32:46.477	\N
25	1	2026-06-17 19:44:46.477	\N
26	1	2026-06-14 20:20:46.477	\N
27	1	2026-06-14 09:56:46.477	\N
28	1	2026-06-11 19:51:46.477	\N
29	2	2026-06-11 08:10:46.477	\N
30	2	2026-06-15 12:15:46.477	\N
31	2	2026-06-08 04:46:46.477	\N
32	2	2026-06-12 17:25:46.477	\N
33	2	2026-05-22 14:47:46.477	\N
34	2	2026-05-20 20:59:46.477	\N
35	2	2026-05-31 02:06:46.477	\N
36	2	2026-06-12 09:42:46.477	\N
37	2	2026-05-21 00:27:46.477	\N
38	2	2026-05-21 04:12:46.477	\N
39	2	2026-05-27 05:33:46.477	\N
40	2	2026-06-15 22:03:46.477	\N
41	6	2026-05-28 09:16:46.477	\N
42	6	2026-06-18 09:03:46.477	\N
43	6	2026-05-31 02:23:46.477	\N
44	6	2026-05-20 05:49:46.477	\N
45	6	2026-05-26 16:52:46.477	\N
46	6	2026-06-17 08:15:46.477	\N
47	6	2026-05-28 11:58:46.477	\N
48	6	2026-06-15 09:30:46.477	\N
49	6	2026-05-22 08:43:46.477	\N
50	6	2026-06-15 07:46:46.477	\N
51	6	2026-06-14 19:05:46.477	\N
52	6	2026-06-04 06:42:46.477	\N
53	6	2026-06-16 04:36:46.477	\N
54	6	2026-05-25 00:08:46.477	\N
55	6	2026-05-30 23:19:46.477	\N
56	6	2026-05-22 14:57:46.477	\N
57	7	2026-06-13 05:22:46.477	\N
58	7	2026-06-08 11:20:46.477	\N
59	7	2026-05-24 09:52:46.477	\N
60	7	2026-05-27 09:35:46.477	\N
61	7	2026-05-28 06:50:46.477	\N
62	7	2026-06-09 12:22:46.477	\N
63	7	2026-06-07 04:43:46.477	\N
64	7	2026-06-09 07:40:46.477	\N
65	7	2026-06-05 16:10:46.477	\N
66	7	2026-05-29 05:06:46.477	\N
67	8	2026-06-04 05:35:46.477	\N
68	8	2026-05-30 13:23:46.477	\N
69	8	2026-06-03 19:15:46.477	\N
70	8	2026-05-31 19:19:46.477	\N
71	13	2026-05-25 23:20:46.477	\N
72	13	2026-06-01 00:54:46.477	\N
73	13	2026-06-08 17:12:46.477	\N
74	13	2026-06-09 04:02:46.477	\N
75	13	2026-05-31 22:11:46.477	\N
76	13	2026-06-05 07:05:46.477	\N
77	13	2026-05-29 07:56:46.477	\N
78	11	2026-05-29 07:04:46.477	\N
79	11	2026-05-27 04:43:46.477	\N
80	11	2026-06-13 03:49:46.477	\N
81	11	2026-06-06 14:34:46.477	\N
82	11	2026-05-21 18:12:46.477	\N
83	11	2026-05-28 16:30:46.477	\N
84	11	2026-06-14 22:22:46.477	\N
85	11	2026-05-26 00:15:46.477	\N
86	11	2026-05-29 03:49:46.477	\N
87	11	2026-06-08 06:15:46.477	\N
88	11	2026-06-06 07:43:46.477	\N
89	11	2026-06-01 11:36:46.477	\N
90	11	2026-06-16 15:44:46.477	\N
91	11	2026-05-27 04:05:46.477	\N
92	11	2026-05-26 12:58:46.477	\N
93	11	2026-05-21 06:00:46.477	\N
94	11	2026-06-16 00:29:46.477	\N
95	11	2026-06-09 12:33:46.477	\N
96	11	2026-06-08 16:00:46.477	\N
97	11	2026-05-29 19:54:46.477	\N
98	14	2026-06-09 18:52:46.477	\N
99	14	2026-06-04 21:17:46.477	\N
100	14	2026-05-30 07:39:46.477	\N
101	14	2026-06-16 18:53:46.477	\N
102	14	2026-05-22 21:57:46.477	\N
103	14	2026-06-04 15:58:46.477	\N
104	14	2026-06-16 08:57:46.477	\N
105	14	2026-06-16 00:02:46.477	\N
106	14	2026-05-20 19:13:46.477	\N
107	14	2026-06-14 09:25:46.477	\N
108	20	2026-06-20 17:18:05.272623	\N
109	20	2026-06-20 17:18:05.285283	\N
110	16	2026-06-23 23:43:53.046265	\N
111	16	2026-06-23 23:43:53.063067	\N
\.


--
-- Data for Name: templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.templates (id, name, description, preview_url, data, is_active, created_at, updated_at, layout_type) FROM stdin;
1	Вертикальная	Классическая визитка: аватар сверху, контакты в столбик	\N	{}	t	2026-06-08 22:28:10.232348	2026-06-08 22:28:10.232348	vertical
2	Горизонтальная	Аватар слева, контакты справа	\N	{}	t	2026-06-08 22:28:18.908437	2026-06-08 22:28:18.908437	horizontal
3	Краткая	Только аватар, ФИО и соцсети	\N	{}	t	2026-06-08 22:28:22.779807	2026-06-08 22:28:22.779807	compact
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, name, created_at, role) FROM stdin;
1	test@example.com	$2b$10$MXv9DuPLzrOLTdv2WyMOouYPOPH6t4i33wpF5srrMWMPv5m/lJkii	Тестовый Пользователь	2026-05-20 18:41:30.559748	user
3	agroeco@agroeco.ru	$2b$10$HSw3jSby0Gt.368j8mmtkOR7oSNgRpG/61K56e0KVNolSXunQ33zW	Петр	2026-05-20 20:09:13.473774	user
2	krivelodmitry@gmail.com	$2b$10$ndEfx5e3lP3JgdUhpWYn/.oBLIqhYfpUkNPXyLWfyCfIuTaYm/5.G	Дмитрий	2026-05-20 19:34:50.08581	admin
4	admin@cardforge.com	$2b$10$fxjl422WvUXVU7J1NYVuYu6TGB1RCeO9gJiJIR8XEAmnr7E1aBWDi	Главный Админ	2026-05-21 17:39:03.354576	admin
6	user2@example.com	$2b$10$fxjl422WvUXVU7J1NYVuYu6TGB1RCeO9gJiJIR8XEAmnr7E1aBWDi	Елена Смирнова	2026-05-21 17:39:03.354576	user
8	test3@example.com	$2b$10$yx9wnamVyPOXlsfZdEQ9i.2itqTXIjMKnpqLkVOO.oYZSnnPVomme	Тестовый Пользователь	2026-05-23 04:01:47.906295	user
9	regular@example.com	$2b$10$9xWwBssXAo6Ekawnq/sX7OS3zldpvi0W75QnSF4WWt.L9wmPF2SQK	Обычный Пользователь	2026-05-23 04:25:59.287059	user
10	f.fedorov@example.com	$2b$10$.pxVw2J/3oOCSOFUsVv1tuWDhtYLWFIk3uKRvZ8txxed7mo7iCMbG	Федор	2026-05-23 06:37:45.10413	user
12	user1@example.com	$2b$10$RtuDW2HB722zRmIDxa2KSuWFId.jc0kI3HEd/rVZDjeYZku9c83YO	Иван Петров	2026-06-09 19:38:34.246432	user
14	example@gmail.com	$2b$10$2tuTz.3yuc69s/.KT.ggF.vuFrfZfmhvV1vQiTrJxXS9EpBbVgSMi	Сергей Петров	2026-06-18 22:41:13.135099	user
\.


--
-- Name: business_cards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.business_cards_id_seq', 20, true);


--
-- Name: card_views_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.card_views_id_seq', 111, true);


--
-- Name: templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.templates_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: business_cards business_cards_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_cards
    ADD CONSTRAINT business_cards_pkey PRIMARY KEY (id);


--
-- Name: business_cards business_cards_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_cards
    ADD CONSTRAINT business_cards_slug_key UNIQUE (slug);


--
-- Name: card_views card_views_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_views
    ADD CONSTRAINT card_views_pkey PRIMARY KEY (id);


--
-- Name: templates templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: business_cards business_cards_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.business_cards
    ADD CONSTRAINT business_cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: card_views card_views_card_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_views
    ADD CONSTRAINT card_views_card_id_fkey FOREIGN KEY (card_id) REFERENCES public.business_cards(id) ON DELETE CASCADE;


--
-- Name: card_views card_views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.card_views
    ADD CONSTRAINT card_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict ZBHJ1lfDYVcmvt8eV6cPWSmznSLzszd1U0dXACBgrNotrAvTywue3PJaOK8SJTP

