import React, { Component } from 'react'
import Header from '../Header'
import style from './style.css'

class About extends Component {
  render() {
    return (
      <section className="about">
        <article>
          <Header />
          <h1>Catchy Phrase That Let’s Users Know What This Site is About</h1>
          <p><button>Get Started</button></p>
        </article>
        <article>
          <h2>See OSM Data Over Time</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.Curabitur at convallis tortor, vel egestas velit. Vivamus tempusfacilisis mollis. Nullam vitae eros in ipsum suscipit aliquam.Vivamus molestie felis enim, sit amet hendrerit lacus dapibuseget. Quisque faucibus scelerisque dui, nec fermentum lectusegestas ut.</p>
        </article>
        <article>
          <h2>Compare OSM Data at Different Points in Time</h2>
          <p>More about content.</p>
        </article>
        <article>
          <h2>Call to Action That Relates to the Product</h2>
          <button>Get Started</button>
        </article>
      </section>
    )
  }
}

export default About
