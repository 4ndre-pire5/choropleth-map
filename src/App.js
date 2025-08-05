import './App.css';
import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import ChoropletMap from './ChoropletMap';

const DATA_EDUCATION = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';
const DATA_COUNTIES = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';

function App() {

  const [educationData, setEducationData] = useState(null);
  const [countiesData, setCoutiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    const fetchData = async() => {

      try {
        const educationResponse = await d3.json(DATA_EDUCATION);
        const countiesResponse = await d3.json(DATA_COUNTIES);

        if (!educationResponse || !countiesResponse) {
          setError("Não foi possível carregar os dados do gráfico");
        } else {
          setEducationData(educationResponse);   //fips, state, area_name, bachelorsOrHigher
          setCoutiesData(countiesResponse);    //Object { type, objects{}, arcs{}, bbox{}, transform{}}
        }
      } catch (error) {
        setError("Não foi possível carregar os dados do gráfico");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <div id='main'>
        <div id='title'>
          <h1>United States Educational Attainment</h1>
        </div>
        <div id='description'>
          <h2>Percentage of adults age 25 and older with a bachelor's degree or higher(2010-2014)</h2>
        </div>
        {loading ? (
          <p>Carregando dados...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <ChoropletMap educationData={educationData} countiesData={countiesData}/>
        )}
      </div>
    </>
  );
}

export default App;
