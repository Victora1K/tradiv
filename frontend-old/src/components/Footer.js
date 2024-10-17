import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'

function Footer() {
  return (
    <footer className="chartss">
        <Container>
            <Row>
                <Col classname='text-center py-3'>
                    Copyright &copy; Tradispline
                </Col>
                
            </Row>
        </Container>

    </footer>
  )
}

export default Footer