import { Language } from '@/types';

const translations = {
  en: {
    // Landing
    welcomeTitle: 'Chatbot Dashboard',
    welcomeSubtitle: 'Welcome — upload a database to get started',
    welcomeDescription: 'Analyse your chatbot handover data with interactive charts, tables, and insights. Supports SQLite (.db, .sqlite), SQL dumps (.sql) and CSV (.csv) — including large files.',
    dropzoneTitle: 'Drop your database file here',
    dropzoneOr: 'or click to browse',
    dropzoneFormats: 'Supports SQLite, SQL dump and CSV',
    uploading: 'Processing…',
    uploadError: 'Could not read file. Make sure it is a valid SQLite, SQL or CSV file.',

    // Nav
    dashboard: 'Dashboard',
    tables: 'Tables',
    newFile: 'New File',
    language: 'Language',

    // Dashboard tabs
    overview: 'Overview',
    handovers: 'Handovers',

    // Overview tab
    totalRecords: 'Total Records',
    totalTables: 'Tables',
    totalColumns: 'Columns',
    dateRange: 'Date Range',
    noDate: 'No date column',
    recentData: 'Recent Data',
    noCharts: 'No charts could be generated for this dataset.',
    loadingCharts: 'Analysing database…',
    rows: 'rows',
    showingRows: 'Showing',
    of: 'of',
    allTablesTitle: 'All Tables',
    tableSummaryRows: 'rows',
    tableSummaryColumns: 'columns',

    // Chatbot metrics
    totalHandovers: 'Total Handovers',
    resolvedRate: 'Resolution Rate',
    avgDuration: 'Avg. Duration',
    topReason: 'Top Reason',
    topChannel: 'Top Channel',
    topAgent: 'Top Agent',

    // Charts
    handoversOverTime: 'Handovers Over Time',
    handoversByReason: 'Handovers by Reason',
    handoversByChannel: 'Handovers by Channel',
    handoversByAgent: 'Handovers by Agent',
    handoversByStatus: 'Handovers by Status',
    distributionOf: 'Distribution of',
    countOver: 'Count Over Time',
    countBy: 'Count by',
    count: 'Count',
    value: 'Value',

    // Filters
    filterTitle: 'Filters',
    addFilter: 'Add filter',
    clearAllFilters: 'Clear all',
    whereLabel: 'WHERE',
    andLabel: 'AND',
    columnLabel: 'Column',
    operatorLabel: 'Operator',
    valueLabel: 'Value',
    value2Label: 'and',
    opEquals: 'equals',
    opNotEquals: 'does not equal',
    opContains: 'contains',
    opNotContains: 'does not contain',
    opStartsWith: 'starts with',
    opEndsWith: 'ends with',
    opGreaterThan: 'is greater than',
    opLessThan: 'is less than',
    opBetween: 'is between',
    opIsEmpty: 'is empty',
    opIsNotEmpty: 'is not empty',
    activeFilters: 'active filter(s)',
    noFilterResults: 'No results match the current filters.',
    showFilters: 'Show filters',
    hideFilters: 'Hide filters',
    filtered: 'filtered',
    selectColumn: 'Select column…',
    enterValue: 'Enter value…',

    // Tables page
    tablesOverview: 'Database Tables',
    tablesDescription: 'Explore the structure of your database',
    tableName: 'Table',
    rowCount: 'Rows',
    columnCount: 'Columns',
    selectTable: 'Select a table to view its structure',
    columnName: 'Column',
    columnType: 'Type',
    sqlType: 'SQL Type',
    inferredType: 'Inferred Type',
    nullable: 'Nullable',
    uniqueValues: 'Unique Values',
    sampleValues: 'Sample Values',
    yes: 'Yes',
    no: 'No',

    // Types
    typeDate: 'Date',
    typeNumber: 'Number',
    typeCategory: 'Category',
    typeBoolean: 'Boolean',
    typeText: 'Text',
  },

  nl: {
    // Landing
    welcomeTitle: 'Chatbot Dashboard',
    welcomeSubtitle: 'Welkom — upload een database om te beginnen',
    welcomeDescription: 'Analyseer uw chatbot handover data met interactieve grafieken, tabellen en inzichten. Ondersteunt SQLite (.db, .sqlite), SQL-dumps (.sql) en CSV (.csv) — inclusief grote bestanden.',
    dropzoneTitle: 'Sleep uw databasebestand hierheen',
    dropzoneOr: 'of klik om te bladeren',
    dropzoneFormats: 'Ondersteunt SQLite, SQL-dump en CSV',
    uploading: 'Verwerken…',
    uploadError: 'Kon het bestand niet lezen. Zorg ervoor dat het een geldig SQLite-, SQL- of CSV-bestand is.',

    // Nav
    dashboard: 'Dashboard',
    tables: 'Tabellen',
    newFile: 'Nieuw Bestand',
    language: 'Taal',

    // Dashboard tabs
    overview: 'Overzicht',
    handovers: 'Handovers',

    // Overview tab
    totalRecords: 'Totaal Records',
    totalTables: 'Tabellen',
    totalColumns: 'Kolommen',
    dateRange: 'Datumbereik',
    noDate: 'Geen datumkolom',
    recentData: 'Recente Data',
    noCharts: 'Er konden geen grafieken worden gegenereerd voor deze dataset.',
    loadingCharts: 'Database analyseren…',
    rows: 'rijen',
    showingRows: 'Weergave',
    of: 'van',
    allTablesTitle: 'Alle Tabellen',
    tableSummaryRows: 'rijen',
    tableSummaryColumns: 'kolommen',

    // Chatbot metrics
    totalHandovers: 'Totaal Handovers',
    resolvedRate: 'Oplossingspercentage',
    avgDuration: 'Gem. Duur',
    topReason: 'Toprede',
    topChannel: 'Topkanaal',
    topAgent: 'Topmedewerker',

    // Charts
    handoversOverTime: 'Handovers in de Tijd',
    handoversByReason: 'Handovers per Reden',
    handoversByChannel: 'Handovers per Kanaal',
    handoversByAgent: 'Handovers per Medewerker',
    handoversByStatus: 'Handovers per Status',
    distributionOf: 'Verdeling van',
    countOver: 'Aantal Over Tijd',
    countBy: 'Aantal per',
    count: 'Aantal',
    value: 'Waarde',

    // Filters
    filterTitle: 'Filters',
    addFilter: 'Filter toevoegen',
    clearAllFilters: 'Alles wissen',
    whereLabel: 'WAARBIJ',
    andLabel: 'EN',
    columnLabel: 'Kolom',
    operatorLabel: 'Operator',
    valueLabel: 'Waarde',
    value2Label: 'en',
    opEquals: 'gelijk aan',
    opNotEquals: 'niet gelijk aan',
    opContains: 'bevat',
    opNotContains: 'bevat niet',
    opStartsWith: 'begint met',
    opEndsWith: 'eindigt met',
    opGreaterThan: 'groter dan',
    opLessThan: 'kleiner dan',
    opBetween: 'tussen',
    opIsEmpty: 'is leeg',
    opIsNotEmpty: 'is niet leeg',
    activeFilters: 'actieve filter(s)',
    noFilterResults: 'Geen resultaten gevonden voor de huidige filters.',
    showFilters: 'Filters tonen',
    hideFilters: 'Filters verbergen',
    filtered: 'gefilterd',
    selectColumn: 'Selecteer kolom…',
    enterValue: 'Voer waarde in…',

    // Tables page
    tablesOverview: 'Databasetabellen',
    tablesDescription: 'Verken de structuur van uw database',
    tableName: 'Tabel',
    rowCount: 'Rijen',
    columnCount: 'Kolommen',
    selectTable: 'Selecteer een tabel om de structuur te bekijken',
    columnName: 'Kolom',
    columnType: 'Type',
    sqlType: 'SQL-type',
    inferredType: 'Afgeleid Type',
    nullable: 'Nullable',
    uniqueValues: 'Unieke Waarden',
    sampleValues: 'Voorbeeldwaarden',
    yes: 'Ja',
    no: 'Nee',

    // Types
    typeDate: 'Datum',
    typeNumber: 'Getal',
    typeCategory: 'Categorie',
    typeBoolean: 'Boolean',
    typeText: 'Tekst',
  },
};

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export default translations;
