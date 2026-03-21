--
-- PostgreSQL database dump
--

\restrict 2DmYvsCn363zKjKGen5GSkWGYTmqDY2SGgUWBcQ6uybOFZrnFFZ3R5Cjjv14C3t

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alignments (
    id integer NOT NULL,
    alignment_no character varying(50),
    alignment_date date NOT NULL,
    customer_name character varying(100),
    vehicle_number character varying(50),
    vehicle_make character varying(100),
    vehicle_model character varying(100),
    technician character varying(100),
    before_data jsonb DEFAULT '{}'::jsonb,
    after_data jsonb DEFAULT '{}'::jsonb,
    amount numeric(10,2) DEFAULT 0,
    status character varying(30) DEFAULT 'Completed'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.alignments OWNER TO postgres;

--
-- Name: alignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alignments_id_seq OWNER TO postgres;

--
-- Name: alignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alignments_id_seq OWNED BY public.alignments.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    table_name character varying(100) NOT NULL,
    record_id character varying(50),
    action character varying(20) NOT NULL,
    changed_data jsonb DEFAULT '{}'::jsonb,
    performed_by character varying(100) DEFAULT 'system'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.bank_accounts (
    id integer NOT NULL,
    bank_name character varying(100) NOT NULL,
    account_number character varying(50) NOT NULL,
    branch_name character varying(100),
    ifsc_code character varying(20),
    opening_balance numeric(15,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    current_balance numeric(12,2) DEFAULT 0,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    account_name character varying(100),
    account_type character varying(50),
    status character varying(20) DEFAULT 'Active'::character varying
);


ALTER TABLE public.bank_accounts OWNER TO siva;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.bank_accounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bank_accounts_id_seq OWNER TO siva;

--
-- Name: bank_accounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.bank_accounts_id_seq OWNED BY public.bank_accounts.id;


--
-- Name: brands; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.brands (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    manufacturer character varying(100),
    category character varying(100),
    country character varying(100),
    description text,
    status character varying(20) DEFAULT 'Active'::character varying NOT NULL
);


ALTER TABLE public.brands OWNER TO siva;

--
-- Name: brands_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.brands_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.brands_id_seq OWNER TO siva;

--
-- Name: brands_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.brands_id_seq OWNED BY public.brands.id;


--
-- Name: cash_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cash_entries (
    id integer NOT NULL,
    entry_no character varying(50),
    entry_date date NOT NULL,
    entry_time character varying(20),
    transaction_type character varying(30),
    reference_no character varying(100),
    description text,
    amount numeric(12,2) DEFAULT 0,
    payment_type character varying(50),
    notes text,
    handled_by character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cash_entries OWNER TO postgres;

--
-- Name: cash_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cash_entries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cash_entries_id_seq OWNER TO postgres;

--
-- Name: cash_entries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cash_entries_id_seq OWNED BY public.cash_entries.id;


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_settings (
    id integer NOT NULL,
    company_name character varying(255),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(20),
    phone character varying(20),
    email character varying(255),
    gst_number character varying(50),
    website character varying(255),
    logo_url text,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.company_settings OWNER TO postgres;

--
-- Name: company_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.company_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.company_settings_id_seq OWNER TO postgres;

--
-- Name: company_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.company_settings_id_seq OWNED BY public.company_settings.id;


--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    customer_code character varying(30),
    customer_name character varying(100) NOT NULL,
    contact_person character varying(100),
    phone character varying(20),
    alternate_phone character varying(20),
    email character varying(100),
    address text,
    city character varying(100),
    state character varying(100),
    pincode character varying(20),
    gst_no character varying(50),
    opening_balance numeric(12,2) DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- Name: estimations; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.estimations (
    id integer NOT NULL,
    estimation_number character varying(50),
    customer_name character varying(200),
    vehicle_number character varying(50),
    estimation_date date,
    total_amount numeric(15,2),
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bill_no character varying(50),
    customer_phone character varying(20),
    vehicle_model character varying(100),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.estimations OWNER TO siva;

--
-- Name: estimations_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.estimations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estimations_id_seq OWNER TO siva;

--
-- Name: estimations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.estimations_id_seq OWNED BY public.estimations.id;


--
-- Name: expenses; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.expenses (
    id integer NOT NULL,
    expense_number character varying(50),
    description text,
    expense_date date,
    amount numeric(15,2),
    category character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.expenses OWNER TO siva;

--
-- Name: expenses_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.expenses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.expenses_id_seq OWNER TO siva;

--
-- Name: expenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.expenses_id_seq OWNED BY public.expenses.id;


--
-- Name: financial_years; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.financial_years (
    id integer NOT NULL,
    year character varying(20) NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    is_active boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.financial_years OWNER TO siva;

--
-- Name: financial_years_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.financial_years_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.financial_years_id_seq OWNER TO siva;

--
-- Name: financial_years_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.financial_years_id_seq OWNED BY public.financial_years.id;


--
-- Name: items; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.items (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    part_number character varying(100),
    brand_id integer,
    hsn_code character varying(20),
    unit character varying(20),
    rate numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(100),
    brand character varying(100),
    gst_rate numeric(10,2) DEFAULT 18,
    purchase_price numeric(10,2) DEFAULT 0,
    selling_price numeric(10,2) DEFAULT 0,
    stock numeric(10,2) DEFAULT 0,
    min_stock numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    type character varying(20) DEFAULT 'Item'::character varying
);


ALTER TABLE public.items OWNER TO siva;

--
-- Name: items_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_id_seq OWNER TO siva;

--
-- Name: items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.items_id_seq OWNED BY public.items.id;


--
-- Name: items_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.items_services (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(50) DEFAULT 'Service'::character varying,
    category character varying(100),
    default_rate numeric(10,2) DEFAULT 0,
    gst_percentage numeric(5,2) DEFAULT 0,
    unit character varying(50),
    hsn_code character varying(50),
    description text,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.items_services OWNER TO postgres;

--
-- Name: items_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.items_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.items_services_id_seq OWNER TO postgres;

--
-- Name: items_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.items_services_id_seq OWNED BY public.items_services.id;


--
-- Name: jobcards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobcards (
    id integer NOT NULL,
    jobcard_no character varying(50) NOT NULL,
    customer_name character varying(100) NOT NULL,
    phone character varying(20),
    vehicle_no character varying(30),
    vehicle_type character varying(50),
    brand character varying(50),
    model character varying(100),
    service_type character varying(100),
    complaint text,
    status character varying(50) DEFAULT 'pending'::character varying,
    estimated_amount numeric(10,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    vehicle_make character varying(100),
    vehicle_model character varying(100),
    vehicle_id integer,
    technician_id integer
);


ALTER TABLE public.jobcards OWNER TO postgres;

--
-- Name: jobcards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobcards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobcards_id_seq OWNER TO postgres;

--
-- Name: jobcards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobcards_id_seq OWNED BY public.jobcards.id;


--
-- Name: labour_bills; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.labour_bills (
    id integer NOT NULL,
    bill_number character varying(50),
    vehicle_number character varying(50),
    vehicle_make_id integer,
    customer_name character varying(200),
    bill_date date,
    total_amount numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer,
    bill_no character varying(50),
    bill_time character varying(20),
    customer_phone character varying(20),
    customer_address text,
    vehicle_make character varying(100),
    vehicle_model character varying(100),
    km_reading character varying(50),
    fuel_level character varying(20),
    items jsonb DEFAULT '[]'::jsonb,
    subtotal numeric(12,2) DEFAULT 0,
    total_gst numeric(12,2) DEFAULT 0,
    discount numeric(12,2) DEFAULT 0,
    grand_total numeric(12,2) DEFAULT 0,
    status character varying(30) DEFAULT 'Completed'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.labour_bills OWNER TO siva;

--
-- Name: labour_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.labour_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.labour_bills_id_seq OWNER TO siva;

--
-- Name: labour_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.labour_bills_id_seq OWNED BY public.labour_bills.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.payments (
    id integer NOT NULL,
    payment_number character varying(50),
    party_name character varying(200),
    payment_date date,
    amount numeric(15,2),
    payment_mode character varying(50),
    bank_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payments OWNER TO siva;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.payments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO siva;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    invoice_number character varying(50),
    supplier_id integer,
    purchase_date date,
    total_amount numeric(15,2),
    gst_amount numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    invoice_no character varying(50)
);


ALTER TABLE public.purchases OWNER TO siva;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO siva;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: receipts; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.receipts (
    id integer NOT NULL,
    receipt_number character varying(50),
    customer_name character varying(200),
    receipt_date date,
    amount numeric(15,2),
    payment_mode character varying(50),
    bank_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    jobcard_id integer,
    jobcard_no character varying(50),
    customer_id integer
);


ALTER TABLE public.receipts OWNER TO siva;

--
-- Name: receipts_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.receipts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.receipts_id_seq OWNER TO siva;

--
-- Name: receipts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.receipts_id_seq OWNED BY public.receipts.id;


--
-- Name: salary_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salary_records (
    id integer NOT NULL,
    salary_no character varying(50),
    staff_id integer,
    staff_name character varying(100),
    month character varying(20),
    year integer,
    basic_salary numeric(10,2) DEFAULT 0,
    allowances numeric(10,2) DEFAULT 0,
    deductions numeric(10,2) DEFAULT 0,
    net_salary numeric(10,2) DEFAULT 0,
    payment_mode character varying(50),
    payment_date date,
    status character varying(30) DEFAULT 'Paid'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.salary_records OWNER TO postgres;

--
-- Name: salary_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salary_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salary_records_id_seq OWNER TO postgres;

--
-- Name: salary_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salary_records_id_seq OWNED BY public.salary_records.id;


--
-- Name: sales; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    invoice_number character varying(50),
    customer_name character varying(200),
    sale_date date,
    total_amount numeric(15,2),
    gst_amount numeric(15,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales OWNER TO siva;

--
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO siva;

--
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.staff (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    mobile character varying(20),
    address text,
    designation character varying(100),
    salary numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    joining_date date,
    bank_account character varying(50),
    ifsc_code character varying(20),
    status character varying(20) DEFAULT 'Active'::character varying,
    email character varying(255),
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff OWNER TO siva;

--
-- Name: staff_advances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_advances (
    id integer NOT NULL,
    advance_no character varying(50),
    staff_id integer,
    staff_name character varying(100),
    advance_date date NOT NULL,
    amount numeric(12,2) DEFAULT 0,
    reason text,
    repayment_type character varying(50),
    repayment_amount numeric(10,2) DEFAULT 0,
    status character varying(30) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff_advances OWNER TO postgres;

--
-- Name: staff_advances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_advances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_advances_id_seq OWNER TO postgres;

--
-- Name: staff_advances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_advances_id_seq OWNED BY public.staff_advances.id;


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.staff_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO siva;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: stock_adjustments; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.stock_adjustments (
    id integer NOT NULL,
    item_id integer,
    quantity numeric(10,2),
    adjustment_type character varying(20),
    reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_adjustments OWNER TO siva;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.stock_adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_adjustments_id_seq OWNER TO siva;

--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.stock_adjustments_id_seq OWNED BY public.stock_adjustments.id;


--
-- Name: stock_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_items (
    id integer NOT NULL,
    item_id integer,
    item_name character varying(255),
    category character varying(100),
    current_stock numeric(10,2) DEFAULT 0,
    min_stock numeric(10,2) DEFAULT 0,
    unit character varying(50),
    purchase_price numeric(10,2) DEFAULT 0,
    selling_price numeric(10,2) DEFAULT 0,
    status character varying(20) DEFAULT 'Active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    supplier_id integer,
    brand_id integer
);


ALTER TABLE public.stock_items OWNER TO postgres;

--
-- Name: stock_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_items_id_seq OWNER TO postgres;

--
-- Name: stock_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_items_id_seq OWNED BY public.stock_items.id;


--
-- Name: suppliers; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.suppliers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(100),
    phone character varying(20),
    email character varying(100),
    address text,
    gst_number character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    company character varying(255),
    city character varying(100),
    state character varying(100),
    pincode character varying(20),
    credit_limit numeric(12,2) DEFAULT 0,
    credit_days integer DEFAULT 0,
    bank_account character varying(50),
    ifsc_code character varying(20),
    mobile character varying(20),
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(100) DEFAULT 'General'::character varying NOT NULL
);


ALTER TABLE public.suppliers OWNER TO siva;

--
-- Name: suppliers_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.suppliers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suppliers_id_seq OWNER TO siva;

--
-- Name: suppliers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.suppliers_id_seq OWNED BY public.suppliers.id;


--
-- Name: transports; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.transports (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    contact_person character varying(100),
    phone character varying(20),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    email character varying(100),
    gst_no character varying(50),
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.transports OWNER TO siva;

--
-- Name: transports_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.transports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transports_id_seq OWNER TO siva;

--
-- Name: transports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.transports_id_seq OWNED BY public.transports.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    email character varying(100),
    role character varying(50) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO siva;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO siva;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicle_makes; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.vehicle_makes (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    make_name character varying(100),
    models jsonb DEFAULT '[]'::jsonb,
    vehicle_type character varying(50),
    country character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.vehicle_makes OWNER TO siva;

--
-- Name: vehicle_makes_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.vehicle_makes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_makes_id_seq OWNER TO siva;

--
-- Name: vehicle_makes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.vehicle_makes_id_seq OWNED BY public.vehicle_makes.id;


--
-- Name: vehicle_register; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicle_register (
    id integer NOT NULL,
    vehicle_number character varying(50) NOT NULL,
    owner_name character varying(100),
    mobile character varying(20),
    vehicle_make character varying(100),
    model character varying(100),
    fuel_type character varying(50),
    chassis_number character varying(100),
    engine_number character varying(100),
    color character varying(50),
    year integer,
    status character varying(20) DEFAULT 'Active'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    customer_id integer
);


ALTER TABLE public.vehicle_register OWNER TO postgres;

--
-- Name: vehicle_register_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicle_register_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicle_register_id_seq OWNER TO postgres;

--
-- Name: vehicle_register_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicle_register_id_seq OWNED BY public.vehicle_register.id;


--
-- Name: work_groups; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.work_groups (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    group_name character varying(100),
    description text,
    work_types_arr jsonb DEFAULT '[]'::jsonb,
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    category character varying(100) DEFAULT 'General'::character varying NOT NULL,
    work_types jsonb
);


ALTER TABLE public.work_groups OWNER TO siva;

--
-- Name: work_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.work_groups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_groups_id_seq OWNER TO siva;

--
-- Name: work_groups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.work_groups_id_seq OWNED BY public.work_groups.id;


--
-- Name: work_types; Type: TABLE; Schema: public; Owner: siva
--

CREATE TABLE public.work_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    group_id integer,
    rate numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    work_type_name character varying(100),
    description text,
    category character varying(100),
    status character varying(20) DEFAULT 'Active'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    avg_duration character varying(100),
    avg_price numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.work_types OWNER TO siva;

--
-- Name: work_types_id_seq; Type: SEQUENCE; Schema: public; Owner: siva
--

CREATE SEQUENCE public.work_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.work_types_id_seq OWNER TO siva;

--
-- Name: work_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: siva
--

ALTER SEQUENCE public.work_types_id_seq OWNED BY public.work_types.id;


--
-- Name: alignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alignments ALTER COLUMN id SET DEFAULT nextval('public.alignments_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: bank_accounts id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.bank_accounts ALTER COLUMN id SET DEFAULT nextval('public.bank_accounts_id_seq'::regclass);


--
-- Name: brands id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.brands ALTER COLUMN id SET DEFAULT nextval('public.brands_id_seq'::regclass);


--
-- Name: cash_entries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_entries ALTER COLUMN id SET DEFAULT nextval('public.cash_entries_id_seq'::regclass);


--
-- Name: company_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_settings ALTER COLUMN id SET DEFAULT nextval('public.company_settings_id_seq'::regclass);


--
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- Name: estimations id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.estimations ALTER COLUMN id SET DEFAULT nextval('public.estimations_id_seq'::regclass);


--
-- Name: expenses id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.expenses ALTER COLUMN id SET DEFAULT nextval('public.expenses_id_seq'::regclass);


--
-- Name: financial_years id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.financial_years ALTER COLUMN id SET DEFAULT nextval('public.financial_years_id_seq'::regclass);


--
-- Name: items id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.items ALTER COLUMN id SET DEFAULT nextval('public.items_id_seq'::regclass);


--
-- Name: items_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_services ALTER COLUMN id SET DEFAULT nextval('public.items_services_id_seq'::regclass);


--
-- Name: jobcards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards ALTER COLUMN id SET DEFAULT nextval('public.jobcards_id_seq'::regclass);


--
-- Name: labour_bills id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.labour_bills ALTER COLUMN id SET DEFAULT nextval('public.labour_bills_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: receipts id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.receipts ALTER COLUMN id SET DEFAULT nextval('public.receipts_id_seq'::regclass);


--
-- Name: salary_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_records ALTER COLUMN id SET DEFAULT nextval('public.salary_records_id_seq'::regclass);


--
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: staff_advances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_advances ALTER COLUMN id SET DEFAULT nextval('public.staff_advances_id_seq'::regclass);


--
-- Name: stock_adjustments id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.stock_adjustments ALTER COLUMN id SET DEFAULT nextval('public.stock_adjustments_id_seq'::regclass);


--
-- Name: stock_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_items ALTER COLUMN id SET DEFAULT nextval('public.stock_items_id_seq'::regclass);


--
-- Name: suppliers id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.suppliers ALTER COLUMN id SET DEFAULT nextval('public.suppliers_id_seq'::regclass);


--
-- Name: transports id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.transports ALTER COLUMN id SET DEFAULT nextval('public.transports_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicle_makes id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.vehicle_makes ALTER COLUMN id SET DEFAULT nextval('public.vehicle_makes_id_seq'::regclass);


--
-- Name: vehicle_register id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_register ALTER COLUMN id SET DEFAULT nextval('public.vehicle_register_id_seq'::regclass);


--
-- Name: work_groups id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.work_groups ALTER COLUMN id SET DEFAULT nextval('public.work_groups_id_seq'::regclass);


--
-- Name: work_types id; Type: DEFAULT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.work_types ALTER COLUMN id SET DEFAULT nextval('public.work_types_id_seq'::regclass);


--
-- Data for Name: alignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alignments (id, alignment_no, alignment_date, customer_name, vehicle_number, vehicle_make, vehicle_model, technician, before_data, after_data, amount, status, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, table_name, record_id, action, changed_data, performed_by, created_at, updated_at) FROM stdin;
1	staff	3	CREATE	{"id": 3, "name": "Test Worker", "email": null, "mobile": "9876543210", "salary": "0.00", "status": "Active", "address": null, "ifsc_code": null, "created_at": "2026-03-18T05:51:53.884Z", "updated_at": "2026-03-18T05:51:53.884Z", "designation": "Mechanic", "bank_account": null, "joining_date": null}	system	2026-03-18 11:21:53.884353	2026-03-18 14:52:38.385577
2	transports	4	CREATE	{"id": 4, "name": "ljdfnldg", "email": "a.sivakumar5880@gmail.com", "phone": "9786403178", "gst_no": "JWNGOWGOWIEGW", "status": "Active", "address": "etho one ok vaa", "created_at": "2026-03-18T06:19:13.359Z", "updated_at": "2026-03-18T06:19:13.359Z", "contact_person": "Siva Kumar"}	system	2026-03-18 11:49:13.359959	2026-03-18 14:52:38.385577
3	work_groups	10	CREATE	{"id": 10, "name": "Test Run API", "status": "Active", "category": "General", "created_at": "2026-03-18T06:24:41.501Z", "group_name": "Test Run API", "updated_at": "2026-03-18T06:24:41.501Z", "work_types": [], "description": "Test Desc", "work_types_arr": []}	system	2026-03-18 11:54:41.501018	2026-03-18 14:52:38.385577
4	work_groups	11	CREATE	{"id": 11, "name": "jhhsdbvkjsd", "status": "Active", "category": "Electrical", "created_at": "2026-03-18T06:25:26.928Z", "group_name": "jhhsdbvkjsd", "updated_at": "2026-03-18T06:25:26.928Z", "work_types": [], "description": "khjsdhbfkjsgbs", "work_types_arr": []}	system	2026-03-18 11:55:26.928448	2026-03-18 14:52:38.385577
5	work_types	6	CREATE	{"id": 6, "name": "Brake Change", "rate": null, "status": "Active", "category": "Mechanical", "group_id": null, "avg_price": "500.00", "created_at": "2026-03-18T06:29:18.067Z", "updated_at": "2026-03-18T06:29:18.067Z", "description": "Change brakes", "avg_duration": "1hr", "work_type_name": "Brake Change"}	system	2026-03-18 11:59:18.067219	2026-03-18 14:52:38.385577
6	work_types	7	CREATE	{"id": 7, "name": "kjjsbgokwd", "rate": null, "status": "Active", "category": "Mechanical", "group_id": null, "avg_price": "0.00", "created_at": "2026-03-18T06:33:06.420Z", "updated_at": "2026-03-18T06:33:06.420Z", "description": "kjhbfkwefg", "avg_duration": "kjfbe", "work_type_name": "kjjsbgokwd"}	system	2026-03-18 12:03:06.420077	2026-03-18 14:52:38.385577
7	work_types	8	CREATE	{"id": 8, "name": "kjbdkfgsd", "rate": null, "status": "Active", "category": "Body Work", "group_id": null, "avg_price": "3244.00", "created_at": "2026-03-18T06:33:19.578Z", "updated_at": "2026-03-18T06:33:19.578Z", "description": "kjsbgfksdg", "avg_duration": "kj235", "work_type_name": "kjbdkfgsd"}	system	2026-03-18 12:03:19.578936	2026-03-18 14:52:38.385577
8	suppliers	3	CREATE	{"id": 3, "city": null, "name": "khbektewe", "email": "a.sivakumar5880@gmail.com", "phone": null, "state": null, "mobile": "9786403178", "status": "Active", "address": "etho one ok vaa", "company": null, "pincode": null, "category": "Parts & Spares", "ifsc_code": null, "created_at": "2026-03-18T06:33:49.837Z", "gst_number": "9842yweotbwt254535", "updated_at": "2026-03-18T06:33:49.837Z", "credit_days": 0, "bank_account": null, "credit_limit": "0.00", "contact_person": "kjsbglwegwsw"}	system	2026-03-18 12:03:49.837704	2026-03-18 14:52:38.385577
9	staff	4	CREATE	{"id": 4, "name": "Siva Kumar", "email": "a.sivakumar5880@gmail.com", "mobile": "9786403178", "salary": "10000.00", "status": "Active", "address": "etho one ok vaa", "ifsc_code": null, "created_at": "2026-03-18T06:34:23.950Z", "updated_at": "2026-03-18T06:34:23.950Z", "designation": "Mechanic", "bank_account": null, "joining_date": "2026-03-11T18:30:00.000Z"}	system	2026-03-18 12:04:23.950643	2026-03-18 14:52:38.385577
10	brands	6	CREATE	{"id": 6, "name": "jhbskeg", "status": "Active", "country": "jhhvaaektwe", "category": "Parts & Spares", "created_at": "2026-03-18T06:35:26.746Z", "updated_at": "2026-03-18T06:35:26.746Z", "description": null, "manufacturer": "jjhbekse"}	system	2026-03-18 12:05:26.746736	2026-03-18 14:52:38.385577
11	staff	5	CREATE	{"id": 5, "name": "Siva Kumar", "email": "a.sivakumar5880@gmail.com", "mobile": "9786403178", "salary": "10000.00", "status": "Active", "address": "etho one ok vaa", "ifsc_code": null, "created_at": "2026-03-18T06:38:17.616Z", "updated_at": "2026-03-18T06:38:17.616Z", "designation": "Mechanic", "bank_account": null, "joining_date": "2026-03-17T18:30:00.000Z"}	system	2026-03-18 12:08:17.616064	2026-03-18 14:52:38.385577
12	items	1	CREATE	{"id": 1, "name": "ouwhbgwg", "rate": null, "type": "Item", "unit": "Piece", "brand": "jsbfgkfweg", "stock": "1000.00", "status": "Active", "brand_id": null, "category": "kjbgklswg", "gst_rate": "18.00", "hsn_code": "hbwkgweeg", "min_stock": "5000.00", "created_at": "2026-03-18T06:56:09.516Z", "updated_at": "2026-03-18T06:56:09.516Z", "part_number": "wjbgoweg", "selling_price": "100.00", "purchase_price": "9.00"}	system	2026-03-18 12:26:09.51663	2026-03-18 14:52:38.385577
13	items	2	CREATE	{"id": 2, "name": "lkbaldfvdsa", "rate": null, "type": "Service", "unit": "Piece", "brand": null, "stock": "0.00", "status": "Active", "brand_id": null, "category": "n,s d,vsdvsdv", "gst_rate": "18.00", "hsn_code": null, "min_stock": "0.00", "created_at": "2026-03-18T07:46:53.569Z", "updated_at": "2026-03-18T07:46:53.569Z", "part_number": null, "selling_price": "1000.00", "purchase_price": "0.00"}	system	2026-03-18 13:16:53.569237	2026-03-18 14:52:38.385577
14	items	3	CREATE	{"id": 3, "name": "klwhogwrg", "rate": null, "type": "Service", "unit": "Piece", "brand": null, "stock": "0.00", "status": "Active", "brand_id": null, "category": "lkwnegwe", "gst_rate": "18.00", "hsn_code": null, "min_stock": "0.00", "created_at": "2026-03-18T07:49:21.642Z", "updated_at": "2026-03-18T07:49:21.642Z", "part_number": null, "selling_price": "1000.00", "purchase_price": "0.00"}	system	2026-03-18 13:19:21.642976	2026-03-18 14:52:38.385577
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.bank_accounts (id, bank_name, account_number, branch_name, ifsc_code, opening_balance, created_at, current_balance, updated_at, account_name, account_type, status) FROM stdin;
1	State Bank of India	1234567890	Main Branch	\N	100000.00	2026-03-05 15:10:01.82258	0.00	2026-03-18 11:21:11.937137	\N	\N	Active
2	HDFC Bank	9876543210	City Center	\N	50000.00	2026-03-05 15:10:01.82258	0.00	2026-03-18 11:21:11.937137	\N	\N	Active
\.


--
-- Data for Name: brands; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.brands (id, name, created_at, updated_at, manufacturer, category, country, description, status) FROM stdin;
1	MRF	2026-03-05 15:10:01.81645	2026-03-18 11:21:11.937137	\N	\N	\N	\N	Active
2	Apollo	2026-03-05 15:10:01.81645	2026-03-18 11:21:11.937137	\N	\N	\N	\N	Active
3	Michelin	2026-03-05 15:10:01.81645	2026-03-18 11:21:11.937137	\N	\N	\N	\N	Active
4	Bridgestone	2026-03-05 15:10:01.81645	2026-03-18 11:21:11.937137	\N	\N	\N	\N	Active
5	Ceat	2026-03-05 15:10:01.81645	2026-03-18 11:21:11.937137	\N	\N	\N	\N	Active
6	jhbskeg	2026-03-18 12:05:26.746736	2026-03-18 12:05:26.746736	jjhbekse	Parts & Spares	jhhvaaektwe	\N	Active
\.


--
-- Data for Name: cash_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cash_entries (id, entry_no, entry_date, entry_time, transaction_type, reference_no, description, amount, payment_type, notes, handled_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: company_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_settings (id, company_name, address, city, state, pincode, phone, email, gst_number, website, logo_url, updated_at) FROM stdin;
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, customer_code, customer_name, contact_person, phone, alternate_phone, email, address, city, state, pincode, gst_no, opening_balance, status, created_at, updated_at) FROM stdin;
1	CUST-001	Siva Transports	Siva	9876543210	\N	siva@kkenterprises.com	Chennai	Chennai	Tamil Nadu	600001	\N	0.00	active	2026-03-17 15:46:28.732775	2026-03-17 15:46:28.732775
2	CUST-002	Kumar Logistics	Kumar	9123456780	\N	kumar@example.com	Coimbatore	Coimbatore	Tamil Nadu	641001	\N	0.00	active	2026-03-17 15:46:28.732775	2026-03-17 15:46:28.732775
3	\N	Siva Kumar	\N	97876403178	\N	a.sivakumar5880@gmail.com	etho one ok vaa	nama city	nama state	600002	IHHJBERTY9Y5	0.00	active	2026-03-17 16:41:16.53186	2026-03-17 16:41:16.53186
4	\N	prasanth 	\N	po89q2754-9254	\N	a.sivakumar5880@gmail.com	etho one ok vaa	nama city	nama state	600002	2O5IB242	0.00	active	2026-03-17 17:37:43.49332	2026-03-17 17:37:43.49332
5	\N	iuwrgw	\N	920475-q6436326	\N	lkdnvasvsdldvns	sldkvnlskvlsd	dlsjvbdlsv	ds,v sa,va	dvj ld	2U4O5720487240	0.00	active	2026-03-17 18:30:09.460607	2026-03-17 18:30:09.460607
6	\N	suresh	\N	9786403178	\N	1234@gmail.com	etho one ok vaa	nama city	nama state	600002	802750753025723	0.00	active	2026-03-18 10:37:06.770851	2026-03-18 10:37:06.770851
7	\N	Siva Kumar	\N	oqehfoqfqkjqbf	\N							0.00	active	2026-03-18 11:11:06.188902	2026-03-18 11:11:06.188902
8	\N	Siva Kumar	\N	oqehfoqfqkjqbf	\N	ljenflqfqfe	etho one ok vaa	nama city	nama state	600002	LJQBNEFQF	0.00	active	2026-03-18 11:11:15.848741	2026-03-18 11:11:15.848741
\.


--
-- Data for Name: estimations; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.estimations (id, estimation_number, customer_name, vehicle_number, estimation_date, total_amount, status, created_at, bill_no, customer_phone, vehicle_model, updated_at) FROM stdin;
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.expenses (id, expense_number, description, expense_date, amount, category, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: financial_years; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.financial_years (id, year, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
1	2025-2026	2025-04-01	2026-03-31	t	2026-03-05 15:10:01.803545	2026-03-18 11:21:11.937137
\.


--
-- Data for Name: items; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.items (id, name, part_number, brand_id, hsn_code, unit, rate, created_at, category, brand, gst_rate, purchase_price, selling_price, stock, min_stock, status, updated_at, type) FROM stdin;
1	ouwhbgwg	wjbgoweg	\N	hbwkgweeg	Piece	\N	2026-03-18 12:26:09.51663	kjbgklswg	jsbfgkfweg	18.00	9.00	100.00	1000.00	5000.00	Active	2026-03-18 12:26:09.51663	Item
2	lkbaldfvdsa	\N	\N	\N	Piece	\N	2026-03-18 13:16:53.569237	n,s d,vsdvsdv	\N	18.00	0.00	1000.00	0.00	0.00	Active	2026-03-18 13:16:53.569237	Service
3	klwhogwrg	\N	\N	\N	Piece	\N	2026-03-18 13:19:21.642976	lkwnegwe	\N	18.00	0.00	1000.00	0.00	0.00	Active	2026-03-18 13:19:21.642976	Service
\.


--
-- Data for Name: items_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.items_services (id, name, type, category, default_rate, gst_percentage, unit, hsn_code, description, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: jobcards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobcards (id, jobcard_no, customer_name, phone, vehicle_no, vehicle_type, brand, model, service_type, complaint, status, estimated_amount, created_at, customer_id, updated_at, vehicle_make, vehicle_model, vehicle_id, technician_id) FROM stdin;
1	JC-2026-03-002	Siva Kumar	97876403178	KA-02-CD-5678	Car	Maruti Suzuki	Swift	Wheel Alignment	03y4w	pending	2790.00	2026-03-17 16:45:05.520123	\N	2026-03-18 11:21:11.937137	\N	\N	\N	\N
\.


--
-- Data for Name: labour_bills; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.labour_bills (id, bill_number, vehicle_number, vehicle_make_id, customer_name, bill_date, total_amount, created_at, customer_id, bill_no, bill_time, customer_phone, customer_address, vehicle_make, vehicle_model, km_reading, fuel_level, items, subtotal, total_gst, discount, grand_total, status, updated_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.payments (id, payment_number, party_name, payment_date, amount, payment_mode, bank_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.purchases (id, invoice_number, supplier_id, purchase_date, total_amount, gst_amount, created_at, updated_at, notes, invoice_no) FROM stdin;
\.


--
-- Data for Name: receipts; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.receipts (id, receipt_number, customer_name, receipt_date, amount, payment_mode, bank_id, created_at, updated_at, jobcard_id, jobcard_no, customer_id) FROM stdin;
\.


--
-- Data for Name: salary_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salary_records (id, salary_no, staff_id, staff_name, month, year, basic_salary, allowances, deductions, net_salary, payment_mode, payment_date, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.sales (id, invoice_number, customer_name, sale_date, total_amount, gst_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.staff (id, name, mobile, address, designation, salary, created_at, joining_date, bank_account, ifsc_code, status, email, updated_at) FROM stdin;
1	Test Staff	1234567890	\N	Technician	15000.00	2026-03-17 19:17:37.681959	2023-01-01	\N	\N	Active	test@example.com	2026-03-18 11:21:11.937137
2	Siva Kumar	9786403178	etho one ok vaa	Mechanic	10000.00	2026-03-17 19:18:43.16793	2026-03-17	\N	\N	Active	a.sivakumar5880@gmail.com	2026-03-18 11:21:11.937137
3	Test Worker	9876543210	\N	Mechanic	0.00	2026-03-18 11:21:53.884353	\N	\N	\N	Active	\N	2026-03-18 11:21:53.884353
4	Siva Kumar	9786403178	etho one ok vaa	Mechanic	10000.00	2026-03-18 12:04:23.950643	2026-03-12	\N	\N	Active	a.sivakumar5880@gmail.com	2026-03-18 12:04:23.950643
5	Siva Kumar	9786403178	etho one ok vaa	Mechanic	10000.00	2026-03-18 12:08:17.616064	2026-03-18	\N	\N	Active	a.sivakumar5880@gmail.com	2026-03-18 12:08:17.616064
\.


--
-- Data for Name: staff_advances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_advances (id, advance_no, staff_id, staff_name, advance_date, amount, reason, repayment_type, repayment_amount, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_adjustments; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.stock_adjustments (id, item_id, quantity, adjustment_type, reason, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stock_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_items (id, item_id, item_name, category, current_stock, min_stock, unit, purchase_price, selling_price, status, created_at, updated_at, supplier_id, brand_id) FROM stdin;
\.


--
-- Data for Name: suppliers; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.suppliers (id, name, contact_person, phone, email, address, gst_number, created_at, company, city, state, pincode, credit_limit, credit_days, bank_account, ifsc_code, mobile, status, updated_at, category) FROM stdin;
1	ABC Auto Parts	\N	9876543210	\N	\N	27ABCDE1234F1Z5	2026-03-05 15:10:01.81961	\N	\N	\N	\N	0.00	0	\N	\N	9876543210	Active	2026-03-18 11:21:11.937137	General
2	XYZ Motors	\N	9876543211	\N	\N	27XYZMP5678G2Z6	2026-03-05 15:10:01.81961	\N	\N	\N	\N	0.00	0	\N	\N	9876543211	Active	2026-03-18 11:21:11.937137	General
3	khbektewe	kjsbglwegwsw	\N	a.sivakumar5880@gmail.com	etho one ok vaa	9842yweotbwt254535	2026-03-18 12:03:49.837704	\N	\N	\N	\N	0.00	0	\N	\N	9786403178	Active	2026-03-18 12:03:49.837704	Parts & Spares
\.


--
-- Data for Name: transports; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.transports (id, name, contact_person, phone, address, created_at, email, gst_no, status, updated_at) FROM stdin;
1	wiuefgwg	wejofgbweg	9023750983275	etho one ok vaa	2026-03-17 18:53:17.731608	a.sivakumar5880@gmail.com	LJNFLSADSFS	Active	2026-03-18 11:21:11.937137
2	suresh transport pvt	suresh	1234567890	etho one ok vaa	2026-03-18 10:37:54.947993	1234@gmail.com	\N	Active	2026-03-18 11:21:11.937137
3	ljnlwvwsvwrb	Siva Kumar	9786403178	etho one ok vaa	2026-03-18 11:12:38.439256	a.sivakumar5880@gmail.com	LKSDNV;KSDVSW	Active	2026-03-18 11:21:11.937137
4	ljdfnldg	Siva Kumar	9786403178	etho one ok vaa	2026-03-18 11:49:13.359959	a.sivakumar5880@gmail.com	JWNGOWGOWIEGW	Active	2026-03-18 11:49:13.359959
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.users (id, username, password, email, role, created_at, updated_at) FROM stdin;
1	admin	admin123	admin@kkenterprises.com	admin	2026-03-05 15:10:01.799641	2026-03-18 14:52:38.385577
2	user	user123	user@kkenterprises.com	user	2026-03-05 15:10:01.799641	2026-03-18 14:52:38.385577
\.


--
-- Data for Name: vehicle_makes; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.vehicle_makes (id, name, created_at, make_name, models, vehicle_type, country, status, updated_at) FROM stdin;
6	Ford	2026-03-05 15:10:01.806415	Ford	[]	\N	\N	Active	2026-03-18 11:21:11.937137
1	Maruti	2026-03-05 15:10:01.806415	Maruti	["Swift", "Baleno", "Alto", "WagonR", "Dzire"]	\N	\N	Active	2026-03-18 11:21:11.937137
2	Hyundai	2026-03-05 15:10:01.806415	Hyundai	["i20", "Creta", "Venue", "Verna", "i10"]	\N	\N	Active	2026-03-18 11:21:11.937137
3	Honda	2026-03-05 15:10:01.806415	Honda	["City", "Amaze", "Civic", "CR-V", "WR-V"]	\N	\N	Active	2026-03-18 11:21:11.937137
4	Toyota	2026-03-05 15:10:01.806415	Toyota	["Innova", "Fortuner", "Glanza", "Camry"]	\N	\N	Active	2026-03-18 11:21:11.937137
5	Tata	2026-03-05 15:10:01.806415	Tata	["Nexon", "Harrier", "Tiago", "Safari", "Punch"]	\N	\N	Active	2026-03-18 11:21:11.937137
7	Mahindra	2026-03-05 15:10:01.806415	Mahindra	["Thar", "XUV700", "Scorpio", "Bolero", "XUV300"]	\N	\N	Active	2026-03-18 11:21:11.937137
\.


--
-- Data for Name: vehicle_register; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicle_register (id, vehicle_number, owner_name, mobile, vehicle_make, model, fuel_type, chassis_number, engine_number, color, year, status, notes, created_at, updated_at, customer_id) FROM stdin;
1	TN69K1234	\N	\N	kj dsgfe	\N	Diesel	\N	\N	\N	\N	Active	\N	2026-03-18 14:12:27.340093	2026-03-18 14:52:38.385577	\N
\.


--
-- Data for Name: work_groups; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.work_groups (id, name, created_at, group_name, description, work_types_arr, status, updated_at, category, work_types) FROM stdin;
1	General Service	2026-03-05 15:10:01.809602	General Service	\N	[]	Active	2026-03-18 11:21:11.937137	General	\N
2	Repair	2026-03-05 15:10:01.809602	Repair	\N	[]	Active	2026-03-18 11:21:11.937137	General	\N
3	Spare Parts	2026-03-05 15:10:01.809602	Spare Parts	\N	[]	Active	2026-03-18 11:21:11.937137	General	\N
4	Labour	2026-03-05 15:10:01.809602	Labour	\N	[]	Active	2026-03-18 11:21:11.937137	General	\N
10	Test Run API	2026-03-18 11:54:41.501018	Test Run API	Test Desc	[]	Active	2026-03-18 11:54:41.501018	General	[]
11	jhhsdbvkjsd	2026-03-18 11:55:26.928448	jhhsdbvkjsd	khjsdhbfkjsgbs	[]	Active	2026-03-18 11:55:26.928448	Electrical	[]
12	Test Name	2026-03-18 12:31:49.233392	Test Group	Test Desc	[]	Active	2026-03-18 12:31:49.233392	General	[]
\.


--
-- Data for Name: work_types; Type: TABLE DATA; Schema: public; Owner: siva
--

COPY public.work_types (id, name, group_id, rate, created_at, work_type_name, description, category, status, updated_at, avg_duration, avg_price) FROM stdin;
1	Oil Change	1	500.00	2026-03-05 15:10:01.812495	Oil Change	\N	\N	Active	2026-03-18 11:21:11.937137	\N	0.00
2	Tyre Rotation	1	300.00	2026-03-05 15:10:01.812495	Tyre Rotation	\N	\N	Active	2026-03-18 11:21:11.937137	\N	0.00
3	Brake Service	2	800.00	2026-03-05 15:10:01.812495	Brake Service	\N	\N	Active	2026-03-18 11:21:11.937137	\N	0.00
4	Engine Repair	2	5000.00	2026-03-05 15:10:01.812495	Engine Repair	\N	\N	Active	2026-03-18 11:21:11.937137	\N	0.00
6	Brake Change	\N	\N	2026-03-18 11:59:18.067219	Brake Change	Change brakes	Mechanical	Active	2026-03-18 11:59:18.067219	1hr	500.00
7	kjjsbgokwd	\N	\N	2026-03-18 12:03:06.420077	kjjsbgokwd	kjhbfkwefg	Mechanical	Active	2026-03-18 12:03:06.420077	kjfbe	0.00
8	kjbdkfgsd	\N	\N	2026-03-18 12:03:19.578936	kjbdkfgsd	kjsbgfksdg	Body Work	Active	2026-03-18 12:03:19.578936	kj235	3244.00
9	Test Type Name	\N	\N	2026-03-18 12:31:49.248762	Test Type	Test Type Desc	General	Active	2026-03-18 12:31:49.248762	1h	100.00
\.


--
-- Name: alignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alignments_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 14, true);


--
-- Name: bank_accounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.bank_accounts_id_seq', 2, true);


--
-- Name: brands_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.brands_id_seq', 6, true);


--
-- Name: cash_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cash_entries_id_seq', 1, false);


--
-- Name: company_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.company_settings_id_seq', 1, false);


--
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 8, true);


--
-- Name: estimations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.estimations_id_seq', 1, false);


--
-- Name: expenses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.expenses_id_seq', 1, false);


--
-- Name: financial_years_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.financial_years_id_seq', 1, true);


--
-- Name: items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.items_id_seq', 3, true);


--
-- Name: items_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.items_services_id_seq', 1, false);


--
-- Name: jobcards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobcards_id_seq', 1, true);


--
-- Name: labour_bills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.labour_bills_id_seq', 1, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.payments_id_seq', 1, false);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.purchases_id_seq', 1, false);


--
-- Name: receipts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.receipts_id_seq', 1, false);


--
-- Name: salary_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salary_records_id_seq', 1, false);


--
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.sales_id_seq', 1, false);


--
-- Name: staff_advances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_advances_id_seq', 1, false);


--
-- Name: staff_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.staff_id_seq', 5, true);


--
-- Name: stock_adjustments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.stock_adjustments_id_seq', 1, false);


--
-- Name: stock_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_items_id_seq', 1, false);


--
-- Name: suppliers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.suppliers_id_seq', 3, true);


--
-- Name: transports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.transports_id_seq', 4, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: vehicle_makes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.vehicle_makes_id_seq', 13, true);


--
-- Name: vehicle_register_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicle_register_id_seq', 1, true);


--
-- Name: work_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.work_groups_id_seq', 12, true);


--
-- Name: work_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: siva
--

SELECT pg_catalog.setval('public.work_types_id_seq', 9, true);


--
-- Name: alignments alignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alignments
    ADD CONSTRAINT alignments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: brands brands_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.brands
    ADD CONSTRAINT brands_pkey PRIMARY KEY (id);


--
-- Name: cash_entries cash_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cash_entries
    ADD CONSTRAINT cash_entries_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: customers customers_customer_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_customer_code_key UNIQUE (customer_code);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: estimations estimations_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.estimations
    ADD CONSTRAINT estimations_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: financial_years financial_years_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.financial_years
    ADD CONSTRAINT financial_years_pkey PRIMARY KEY (id);


--
-- Name: items items_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_pkey PRIMARY KEY (id);


--
-- Name: items_services items_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.items_services
    ADD CONSTRAINT items_services_pkey PRIMARY KEY (id);


--
-- Name: jobcards jobcards_jobcard_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_jobcard_no_key UNIQUE (jobcard_no);


--
-- Name: jobcards jobcards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_pkey PRIMARY KEY (id);


--
-- Name: labour_bills labour_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.labour_bills
    ADD CONSTRAINT labour_bills_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: receipts receipts_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_pkey PRIMARY KEY (id);


--
-- Name: salary_records salary_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_records
    ADD CONSTRAINT salary_records_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: staff_advances staff_advances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_advances
    ADD CONSTRAINT staff_advances_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: stock_adjustments stock_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_pkey PRIMARY KEY (id);


--
-- Name: stock_items stock_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_pkey PRIMARY KEY (id);


--
-- Name: suppliers suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.suppliers
    ADD CONSTRAINT suppliers_pkey PRIMARY KEY (id);


--
-- Name: transports transports_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.transports
    ADD CONSTRAINT transports_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: vehicle_makes vehicle_makes_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.vehicle_makes
    ADD CONSTRAINT vehicle_makes_pkey PRIMARY KEY (id);


--
-- Name: vehicle_register vehicle_register_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_register
    ADD CONSTRAINT vehicle_register_pkey PRIMARY KEY (id);


--
-- Name: vehicle_register vehicle_register_vehicle_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_register
    ADD CONSTRAINT vehicle_register_vehicle_number_key UNIQUE (vehicle_number);


--
-- Name: work_groups work_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.work_groups
    ADD CONSTRAINT work_groups_pkey PRIMARY KEY (id);


--
-- Name: work_types work_types_pkey; Type: CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.work_types
    ADD CONSTRAINT work_types_pkey PRIMARY KEY (id);


--
-- Name: idx_audit_logs_table_record; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_table_record ON public.audit_logs USING btree (table_name, record_id);


--
-- Name: items items_brand_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.items
    ADD CONSTRAINT items_brand_id_fkey FOREIGN KEY (brand_id) REFERENCES public.brands(id);


--
-- Name: jobcards jobcards_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: jobcards jobcards_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: jobcards jobcards_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobcards
    ADD CONSTRAINT jobcards_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicle_register(id) ON DELETE SET NULL;


--
-- Name: labour_bills labour_bills_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.labour_bills
    ADD CONSTRAINT labour_bills_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: labour_bills labour_bills_vehicle_make_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.labour_bills
    ADD CONSTRAINT labour_bills_vehicle_make_id_fkey FOREIGN KEY (vehicle_make_id) REFERENCES public.vehicle_makes(id);


--
-- Name: payments payments_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.bank_accounts(id);


--
-- Name: purchases purchases_supplier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id);


--
-- Name: receipts receipts_bank_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_bank_id_fkey FOREIGN KEY (bank_id) REFERENCES public.bank_accounts(id);


--
-- Name: receipts receipts_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.receipts
    ADD CONSTRAINT receipts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: salary_records salary_records_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salary_records
    ADD CONSTRAINT salary_records_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: staff_advances staff_advances_staff_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_advances
    ADD CONSTRAINT staff_advances_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id) ON DELETE SET NULL;


--
-- Name: stock_adjustments stock_adjustments_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.stock_adjustments
    ADD CONSTRAINT stock_adjustments_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items(id);


--
-- Name: stock_items stock_items_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_items
    ADD CONSTRAINT stock_items_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items_services(id) ON DELETE SET NULL;


--
-- Name: vehicle_register vehicle_register_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicle_register
    ADD CONSTRAINT vehicle_register_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: work_types work_types_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: siva
--

ALTER TABLE ONLY public.work_types
    ADD CONSTRAINT work_types_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.work_groups(id);


--
-- PostgreSQL database dump complete
--

\unrestrict 2DmYvsCn363zKjKGen5GSkWGYTmqDY2SGgUWBcQ6uybOFZrnFFZ3R5Cjjv14C3t

