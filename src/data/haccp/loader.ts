import product_en from './haccp_product_description_questions_v1.json';
import product_es from './haccp_product_description_questions_v1.es.json';
import product_fr from './haccp_product_description_questions_v1.fr.json';
import product_pt from './haccp_product_description_questions_v1.pt.json';

import process_en from './haccp_process_flow_questions_v1.json';
import process_es from './haccp_process_flow_questions_v1.es.json';
import process_fr from './haccp_process_flow_questions_v1.fr.json';
import process_pt from './haccp_process_flow_questions_v1.pt.json';

import prp_en from './haccp_prerequisite_programs_questions_v1.json';
import prp_es from './haccp_prerequisite_programs_questions_v1.es.json';
import prp_fr from './haccp_prerequisite_programs_questions_v1.fr.json';
import prp_pt from './haccp_prerequisite_programs_questions_v1.pt.json';

import hazard_en from './haccp_hazard_analysis_questions_v1.json';
import hazard_es from './haccp_hazard_analysis_questions_v1.es.json';
import hazard_fr from './haccp_hazard_analysis_questions_v1.fr.json';
import hazard_pt from './haccp_hazard_analysis_questions_v1.pt.json';

import ccp_det_en from './haccp_ccp_determination_questions_v1.json';
import ccp_det_es from './haccp_ccp_determination_questions_v1.es.json';
import ccp_det_fr from './haccp_ccp_determination_questions_v1.fr.json';
import ccp_det_pt from './haccp_ccp_determination_questions_v1.pt.json';

import ccp_man_en from './haccp_ccp_management_questions_v1.json';
import ccp_man_es from './haccp_ccp_management_questions_v1.es.json';
import ccp_man_fr from './haccp_ccp_management_questions_v1.fr.json';
import ccp_man_pt from './haccp_ccp_management_questions_v1.pt.json';

import valid_en from './haccp_verification_validation_review_v1.json';
import valid_es from './haccp_verification_validation_review_v1.es.json';
import valid_fr from './haccp_verification_validation_review_v1.fr.json';
import valid_pt from './haccp_verification_validation_review_v1.pt.json';

const dictionaries: any = {
    product: { en: product_en, es: product_es, fr: product_fr, pt: product_pt },
    process: { en: process_en, es: process_es, fr: process_fr, pt: process_pt },
    prp: { en: prp_en, es: prp_es, fr: prp_fr, pt: prp_pt },
    hazards: { en: hazard_en, es: hazard_es, fr: hazard_fr, pt: hazard_pt },
    ccp_determination: { en: ccp_det_en, es: ccp_det_es, fr: ccp_det_fr, pt: ccp_det_pt },
    ccp_management: { en: ccp_man_en, es: ccp_man_es, fr: ccp_man_fr, pt: ccp_man_pt },
    validation: { en: valid_en, es: valid_es, fr: valid_fr, pt: valid_pt },
};

export function getQuestions(section: string, lang: string = 'en') {
    const sectionData = dictionaries[section];
    if (!sectionData) return null;
    return sectionData[lang] || sectionData['en'];
}