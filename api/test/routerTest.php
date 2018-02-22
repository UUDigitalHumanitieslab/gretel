<?php


require './vendor/autoload.php';

class RouterTests extends \PHPUnit_Framework_TestCase
{


    protected $client;

    protected function setUp()
    {
        $this->client = new GuzzleHttp\Client([
            'base_uri' => 'http://localhost:80/gretel/api/src/router.php/'
        ]);
    }

    public function testParseSentenceRoute()
    {
        $data = array(
            'sentence' => 'Dit is een zin'
        );
        $response=  $this->client->post('parse_sentence', [GuzzleHttp\RequestOptions::JSON => $data]);
        $data = json_decode($response->getBody(), true);

        $this->assertContains(".xml", $data["file_ref"]);


    }

}