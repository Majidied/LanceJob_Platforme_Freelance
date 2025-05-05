import { Card } from '@material-tailwind/react';
import react from 'react';
import CardService from './cardService';
import dev from '../../assets/dev.svg';
import design from '../../assets/design.svg';
import finance from '../../assets/finance.svg';
import project from '../../assets/projects.svg';
import product from '../../assets/products.svg';
import assistant from '../../assets/assistant.svg';
const Service = () => {
    return (
        <div id='service' className='items-center flex-row md:flex-row px-4 sm:px-8 md:px-12 lg:px-16 py-8 md:py-16 space-y-14' >
            <div className='text-center space-y-5'>
            <h1 className='text-[#829C9E] text-2xl font-bold'>Leverage World-Class Talent</h1>
            <p className='text-[#686565]'>We are the largest. globoly-distributed network of top business. design. ond
                technology talent, ready to tackle your most important initiatives.</p>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 px-5 sm:px-6'>
                <CardService icon={dev} title={"Developpers"} body={"Seasored software engineers, coders, architects with expertise across hundreds of technologies"} />
                <CardService icon={design} title={"Design"} body={"UI, UX, Visual, and Interaction designers as well as a wide range of strations, animations, and more."}/>
                <CardService  icon={finance} title={"Finance experts"} body={"Experts in financial modeling vaduation, startupfunding, interim CEO work, and market sizing."}/>
                <CardService  icon={project} title={"Projects Managers"} body={"Digital and technical ptoject managers, scrum masters, and more with expertise to numerous PM tools, firamworks, and styles."}/>
                <CardService icon={product} title={"Product Managers"} body={"Digital product managers, scrum product owners, with expertise in numerous industries like banking, healthcare, e-commerce, and more."}/>
                <CardService icon={assistant} title={"Virtual Assistants"} body={"Lancejob projects consultants assemble managed teams of seasoned experts for your most urgent business needs."}/>
            </div>

        </div>
    );
}
export default Service;