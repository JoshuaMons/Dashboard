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

    // Cache banner
    restoredFromCache: 'Database restored from your last session.',
    clearCache: 'Clear',
    dismiss: 'Dismiss',

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
    applyFilters: 'Apply filters',
    pendingChanges: 'unapplied changes',
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
    filtersApplied: 'filters applied',

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

    // Data table actions
    searchTable: 'Search table…',
    exportCSV: 'Export CSV',
    prev: 'Prev',
    next: 'Next',

    // Column statistics
    statsTitle: 'Column Statistics',
    statMin: 'Min',
    statMax: 'Max',
    statMean: 'Mean',
    statMedian: 'Median',
    statNulls: 'Nulls',

    // Column detail modal
    colModalType: 'Inferred Type',
    colModalSqlType: 'SQL Type',
    colModalNullable: 'Nullable',
    colModalUniqueValues: 'Unique Values',
    colModalTotalRows: 'Total Rows',
    colModalNullValues: 'Null Values',
    colModalDistribution: 'Value Distribution',
    colModalTopValues: 'Top Values',
    colModalCount: 'Count',
    colModalShare: 'Share',
    colModalOther: '(other)',
    colModalDescription: 'About this column',
    colModalNoData: 'Not enough data to show a distribution.',

    // Chart subtitle / interaction strings
    chartTotal: 'Total',
    chartAvgPeriod: 'Avg/period',
    chartPeriods: 'periods',
    zoomHint: 'Drag the handles to zoom · Drag the bar to pan',
    zoomEnable: 'Enable zoom / pan',
    zoomDisable: 'Disable zoom',
    recentTrend: 'Recent trend vs. earlier periods',
    chartCategories: 'categories',
    hoverToInspect: 'hover to inspect',
    chartTotalLabel: 'total',
    clearSelection: 'clear',
    chartSelected: 'Selected',
    clickToClear: 'click again or clear to reset',
    chartNo1: '#1',
    tooltipCount: 'Count',
    tooltipPctOfTotal: '% of total',
    tooltipVsAvg: 'vs avg',
    tooltipShare: 'Share',
    tooltipRank: 'Rank',

    // Theme
    themeLight: 'Light mode',
    themeDark: 'Dark mode',

    // Nullable badge
    nullableBadge: 'nullable',

    // Auto-generated column descriptions
    descDate: 'Stores timestamps or dates. Use this column for time-series analysis and trend detection over time.',
    descNumber: 'Contains numeric values. Suitable for statistical analysis, averages, and distribution charts.',
    descCategory: 'A categorical column with a fixed set of recurring values. Ideal for grouping and filtering data.',
    descBoolean: 'A binary flag (yes/no or true/false). Indicates whether a particular condition applies to each record.',
    descText: 'Free-form text with high variability. Best used for searching or keyword-based analysis.',
    descStatus: 'Tracks the current state or outcome of each record, such as resolved, open, or closed.',
    descReason: 'Captures the reason, cause, or category that triggered this record.',
    descAgent: 'Identifies the agent, employee, or operator responsible for handling this record.',
    descChannel: 'Indicates the communication channel or source through which this record originated.',
    descDuration: 'Measures the time spent on each record, such as handling or waiting time.',
    descCustomer: 'References the customer, client, or contact associated with this record.',
    descHandover: 'Records whether or when a handover or escalation occurred.',
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

    // Cache banner
    restoredFromCache: 'Database hersteld van uw laatste sessie.',
    clearCache: 'Wissen',
    dismiss: 'Verbergen',

    // Dashboard tabs
    overview: 'Overzicht',
    handovers: 'Handovers',

    // Overview tab
    totalRecords: 'Totaal Records',
    totalTables: 'Tabellen',
    totalColumns: 'Totaal Kolommen',
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
    applyFilters: 'Filters toepassen',
    pendingChanges: 'niet-toegepaste wijzigingen',
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
    filtersApplied: 'filters toegepast',

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

    // Data table actions
    searchTable: 'Zoek in tabel…',
    exportCSV: 'CSV exporteren',
    prev: 'Vorige',
    next: 'Volgende',

    // Column statistics
    statsTitle: 'Kolomstatistieken',
    statMin: 'Min',
    statMax: 'Max',
    statMean: 'Gemiddelde',
    statMedian: 'Mediaan',
    statNulls: 'Leeg',

    // Column detail modal
    colModalType: 'Afgeleid Type',
    colModalSqlType: 'SQL-type',
    colModalNullable: 'Nullable',
    colModalUniqueValues: 'Unieke Waarden',
    colModalTotalRows: 'Totaal Rijen',
    colModalNullValues: 'Lege Waarden',
    colModalDistribution: 'Waardenverdeling',
    colModalTopValues: 'Topwaarden',
    colModalCount: 'Aantal',
    colModalShare: 'Aandeel',
    colModalOther: '(overig)',
    colModalDescription: 'Over deze kolom',
    colModalNoData: 'Onvoldoende gegevens voor een verdeling.',

    // Chart subtitle / interaction strings
    chartTotal: 'Totaal',
    chartAvgPeriod: 'Gem/periode',
    chartPeriods: 'perioden',
    zoomHint: 'Sleep de handvatten om in te zoomen · Sleep de balk om te pannen',
    zoomEnable: 'Zoom / pan inschakelen',
    zoomDisable: 'Zoom uitschakelen',
    recentTrend: 'Recente trend t.o.v. eerdere perioden',
    chartCategories: 'categorieën',
    hoverToInspect: 'hover om te inspecteren',
    chartTotalLabel: 'totaal',
    clearSelection: 'wissen',
    chartSelected: 'Geselecteerd',
    clickToClear: 'klik opnieuw of wis om te resetten',
    chartNo1: '#1',
    tooltipCount: 'Aantal',
    tooltipPctOfTotal: '% van totaal',
    tooltipVsAvg: 'vs gem',
    tooltipShare: 'Aandeel',
    tooltipRank: 'Rang',

    // Theme
    themeLight: 'Lichte modus',
    themeDark: 'Donkere modus',

    // Nullable badge
    nullableBadge: 'nullable',

    // Auto-generated column descriptions
    descDate: 'Bevat tijdstempels of datums. Gebruik deze kolom voor tijdreeksanalyse en het detecteren van trends.',
    descNumber: 'Bevat numerieke waarden. Geschikt voor statistische analyse, gemiddelden en verdelingsgrafieken.',
    descCategory: 'Een categoriekolom met een vaste set terugkerende waarden. Ideaal voor groeperen en filteren.',
    descBoolean: 'Een binaire vlag (ja/nee of waar/onwaar). Geeft aan of een bepaalde voorwaarde van toepassing is.',
    descText: 'Vrije tekst met hoge variabiliteit. Het beste geschikt voor zoeken of trefwoordanalyse.',
    descStatus: 'Registreert de huidige staat of uitkomst van elk record, zoals opgelost, open of gesloten.',
    descReason: 'Legt de reden, oorzaak of categorie vast die dit record heeft getriggerd.',
    descAgent: 'Identificeert de medewerker, agent of operator die verantwoordelijk is voor dit record.',
    descChannel: 'Geeft het communicatiekanaal of de bron aan van waaruit dit record is ontstaan.',
    descDuration: 'Meet de bestede tijd per record, zoals afhandel- of wachttijd.',
    descCustomer: 'Verwijst naar de klant, opdrachtgever of contactpersoon bij dit record.',
    descHandover: 'Registreert of en wanneer een overdracht of escalatie heeft plaatsgevonden.',
  },
};

export type TranslationKey = keyof typeof translations.en;

export function t(lang: Language, key: TranslationKey): string {
  return translations[lang][key] ?? translations.en[key] ?? key;
}

export default translations;
