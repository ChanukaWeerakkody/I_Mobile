import NavigationMenu from "../ui/navbar/navbar";
import { Outlet } from 'react-router-dom';

function Layout() {
    return (
        <div className="flex min-h-screen bg-[#14141E]">
            <div className="w-full md:w-[25vw] lg:w-[20vw] xl:w-[15vw] p-4">
                <NavigationMenu />
            </div>
            <main className="w-full md:max-w-[75vw] lg:max-w-[80vw] xl:max-w-[85vw] flex-1 p-8 overflow-y-auto flex flex-col justify-start mx-auto">
                <div className="w-full overflow-x-hidden">
                    <Outlet />
                </div>
            </main>
        </div>

    );
}

export default Layout;
