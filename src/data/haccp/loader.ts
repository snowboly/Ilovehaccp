import product_en from './haccp_product_description_questions_v1.json';
import process_en from './haccp_process_flow_questions_v1.json';
import prp_en from './haccp_prerequisite_programs_questions_v1.json';
import hazard_en from './haccp_hazard_analysis_questions_v1.json';
import ccp_det_en from './haccp_ccp_determination_questions_v1.json';
import ccp_man_en from './haccp_ccp_management_questions_v1.json';
import valid_en from './haccp_verification_validation_review_v1.json';

const dictionaries: any = {
    product: { en: product_en },
    process: { en: process_en },
    prp: { en: prp_en },
    hazards: { en: hazard_en },
    ccp_determination: { en: ccp_det_en },
    ccp_management: { en: ccp_man_en },
    validation: { en: valid_en },
};

export function getQuestions(section: string, lang: string = 'en') {
    const sectionData = dictionaries[section];
    if (!sectionData) return null;
    return sectionData[lang] || sectionData['en'];
}
