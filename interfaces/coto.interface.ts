export interface ICotoResponse {
    response: Response;
    result_id: string;
    request: Request;
}

export interface Request {
    sort_by: string;
    sort_order: string;
    num_results_per_page: number;
    pre_filter_expression: PreFilterExpression;
    origin_referrer: string;
    blacklist_rules: boolean;
    term: string;
    page: number;
    fmt_options: FmtOptions;
    section: string;
    features: { [key: string]: boolean };
    feature_variants: FeatureVariants;
    searchandized_items: SearchandizedItems;
    browse_filter_name: string;
    browse_filter_value: BrowseFilterValue;
}

export enum BrowseFilterValue {
    Catv00001254 = "catv00001254",
    Catv00001270 = "catv00001270",
    Catv00002784 = "catv00002784",
}

export interface FeatureVariants {
    query_items: string;
    a_a_test: null;
    auto_generated_refined_query_rules: string;
    manual_searchandizing: null;
    personalization: string;
    filter_items: string;
    use_reranker_service_for_search: null;
    use_reranker_service_for_browse: null;
    use_reranker_service_for_all: null;
    custom_autosuggest_ui: null;
    disable_test_only_global_rules_search: null;
    disable_test_only_global_rules_browse: null;
    use_enriched_attributes_as_fuzzy_searchable: null;
    recommendations_merge_allowlist_rules: null;
    reranker_transformations_browse: null;
    disable_test_only_tag_rules: null;
    reranker_transformations_search: null;
    reranker_transformations_autocomplete: null;
    use_ces_blending: null;
    refined_tag_rules: null;
}

export interface FmtOptions {
    groups_start: string;
    groups_max_depth: number;
    show_hidden_facets: boolean;
    show_hidden_fields: boolean;
    show_protected_facets: boolean;
}

export interface PreFilterExpression {
    name: string;
    value: string;
}

export interface SearchandizedItems {
}

export interface Response {
    result_sources: ResultSources;
    facets: Facet[];
    groups: ResponseGroup[];
    results: Result[];
    sort_options: SortOption[];
    refined_content: any[];
    total_num_results: number;
    features: Feature[];
    related_searches: RelatedSearch[];
    related_browse_pages: RelatedBrowsePage[];
}

export interface Facet {
    display_name: string;
    name: string;
    type: string;
    options: Option[];
    hidden: boolean;
    data: SearchandizedItems;
}

export interface Option {
    status: string;
    count: number;
    display_name: string;
    value: string;
    data: SearchandizedItems;
}

export interface Feature {
    feature_name: string;
    display_name: string;
    enabled: boolean;
    variant: Variant | null;
}

export interface Variant {
    name: string;
    display_name: string;
}

export interface ResponseGroup {
    group_id: BrowseFilterValue;
    display_name: GroupDisplayName;
    count: number;
    data: GroupData;
    children: any[];
    parents: Parent[];
}

export interface GroupData {
    url: string;
}

export enum GroupDisplayName {
    Almacén = "Almacén",
    Azúcar = "Azúcar",
    Endulzantes = "Endulzantes",
}

export interface Parent {
    display_name: ParentDisplayName;
    group_id: GroupID;
}

export enum ParentDisplayName {
    Almacén = "Almacén",
    Categorias = "Categorias",
    Endulzantes = "Endulzantes",
}

export enum GroupID {
    Categoria = "categoria",
    Catv00001254 = "catv00001254",
    Catv00001270 = "catv00001270",
}

export interface RelatedBrowsePage {
    filter_name: string;
    filter_value: string;
    display_name: string;
    image_url: string;
}

export interface RelatedSearch {
    query: string;
}

export interface ResultSources {
    token_match: Match;
    embeddings_match: Match;
}

export interface Match {
    count: number;
}

export interface Result {
    matched_terms: any[];
    labels: SearchandizedItems;
    data: ResultData;
    value: string;
    is_slotted: boolean;
}

export interface ResultData {
    id: string;
    url: string;
    price: Price[];
    sku_id: string;
    sku_plu: number;
    discounts: Discount[];
    sale_type: string[];
    image_url: string;
    product_brand: string;
    product_is_noa: number;
    product_format: ProductFormat;
    sku_description: string;
    product_main_ean: number;
    sku_display_name: string;
    product_weighable: number;
    store_availability: string[];
    product_list_price: number;
    product_quantity_step: number;
    product_unit_of_measure: ProductUnitOfMeasure;
    product_large_image_url: string;
    product_format_quantity: number;
    product_minimum_quantity: number;
    product_medium_image_url: string;
    discounts_payment_methods: DiscountsPaymentMethod[];
    groups: DataGroup[];
}

export interface Discount {
    id: string;
    comments: string;
    takingText: null;
    discountText: string;
    regularPrice: null;
    discountImage: null;
    discountPrice: string;
    regularPriceText: string;
}

export interface DiscountsPaymentMethod {
    id: string;
    comentarios: string;
    precioCuota: string;
    cantidadCuotas: string;
    imagenDescuento: string;
}

export interface DataGroup {
    group_id: BrowseFilterValue;
    display_name: GroupDisplayName;
    path: Path;
    path_list: PathList[];
}

export enum Path {
    Categoria = "/categoria",
    CategoriaCatv00001254 = "/categoria/catv00001254",
    CategoriaCatv00001254Catv00001270 = "/categoria/catv00001254/catv00001270",
}

export interface PathList {
    id: GroupID;
    display_name: ParentDisplayName;
}

export interface Price {
    id: string;
    store: string;
    listPrice: number;
    priceList: string;
    saleImage1: SaleImage1 | null;
    saleImage2: SaleImage2 | null;
    saleImage3: null;
    formatPrice: number;
    priceWithoutTax: number | null;
}

export enum SaleImage1 {
    OfertaPNG = "oferta.png",
}

export enum SaleImage2 {
    NoAcumulablePNG = "NoAcumulable.png",
}

export enum ProductFormat {
    Kilo = "Kilo",
    Kilogramo = "Kilogramo",
    KilogramoEscurrido = "Kilogramo escurrido",
}

export enum ProductUnitOfMeasure {
    Uni = "UNI",
}

export interface SortOption {
    sort_by: string;
    display_name: string;
    sort_order: string;
    status: string;
    hidden: boolean;
}
