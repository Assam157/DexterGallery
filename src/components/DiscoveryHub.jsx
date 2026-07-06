 import React from "react";
import { useNavigate } from "react-router-dom";

const exhibits = [

{
    title:"🌌 Galaxy Collision Simulator",
    folder:"GalaxyCollision",
    category:"Astrophysics",
    description:"Interactive N-body galaxy collision simulation demonstrating gravitational dynamics."
},

{
    title:"🌠 Night Sky Simulator",
    folder:"NightSkySimulator",
    category:"Astronomy",
    description:"Explore constellations, stars and celestial navigation in a dynamic night sky."
},

{
    title:"🔭 Advanced Galaxy Finder",
    folder:"DiscoverSolarSystems",
    category:"Astronomy",
    description:"Interactive stellar and exoplanet discovery environment."
},

{
    title:"☀️ Stellar Spectroscopy Laboratory",
    folder:"SunStellarDiscovery",
    category:"Astrophysics",
    description:"NASA-inspired stellar spectroscopy and stellar classification simulator."
},

{
    title:"🧬 Discover Cell Life",
    folder:"CellLifeCycle",
    category:"Biology",
    description:"Interactive visualization of mitosis, cell division and biological processes."
},

{
    title:"🦠 Antibody–Antigen Console",
    folder:"AntibodyAntigenConsole",
    category:"Biology",
    description:"Interactive immune response and antigen binding visualization."
},

{
    title:"🌀 Fractal Wall",
    folder:"FractalWall",
    category:"Mathematics",
    description:"GPU accelerated fractal explorer with interactive rendering."
}

];

export default function DiscoveryHub(){

    const navigate = useNavigate();

    const openProject=(folder)=>{

        window.open(`/${folder}/index.html`,"_blank");

    };

    return(

    <div
    style={{
        minHeight:"100vh",
        background:"radial-gradient(circle,#051018,#000)",
        color:"#0f0",
        fontFamily:"monospace",
        padding:"35px"
    }}
    >

        <button
        className="lab-btn"
        onClick={()=>navigate("/")}
        >
        ← Return To Dexter Labs
        </button>

        <h1
        style={{
            marginTop:"30px",
            textAlign:"center"
        }}
        >
        🌌 DEXTER DISCOVERY CENTER
        </h1>

        <p
        style={{
            textAlign:"center",
            color:"#88ffaa",
            marginBottom:"45px"
        }}
        >
        Advanced ThreeJS Scientific Simulations & Interactive Discovery Exhibits
        </p>

        <div
        style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",
            gap:"25px"
        }}
        >

        {exhibits.map((item)=>(

        <div

        key={item.folder}

        style={{
            background:"#111",
            border:"2px solid #00ff88",
            borderRadius:"18px",
            padding:"25px",
            boxShadow:"0 0 18px rgba(0,255,150,.25)",
            transition:"0.3s"
        }}

        >

            <h2>{item.title}</h2>

            <h4
            style={{
                color:"#77ffcc"
            }}
            >
            {item.category}
            </h4>

            <p
            style={{
                lineHeight:1.6
            }}
            >
            {item.description}
            </p>

            <button

            className="lab-btn"

            onClick={()=>openProject(item.folder)}

            >

            🚀 Launch Exhibit

            </button>

        </div>

        ))}

        </div>

    </div>

    );

}