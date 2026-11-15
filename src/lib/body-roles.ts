/** What each charging body on a two tier bill pays for, in plain words.
 * Council lines follow GOV.UK's list of services for each type of council; police and fire
 * follow the body names on the council's own schedule. Browser safe.
 */
import type {ChargeKind} from './local-bill';
export const BODY_ROLES_SOURCE={publisher:'GOV.UK',title:'Understand how your council works: types of council',url:'https://www.gov.uk/understand-how-your-council-works/types-of-council',updated:'2017-10-24'};
const ROLES:Partial<Record<ChargeKind,string>>={
 billing:'Services like rubbish collection, recycling, housing and planning applications. It also collects the whole bill and passes the other parts on.',
 county:'Services across the whole county, like education, transport, social care, libraries, waste management and trading standards.',
 police:'Policing.',
 fire:'Fire and rescue.',
 parish:'Local services where the parish provides them, like allotments, play areas, community centres and bus shelters.',
};
export const bodyRole=(kind:ChargeKind)=>ROLES[kind]??null;
