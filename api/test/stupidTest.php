<?php


require './vendor/autoload.php';

class ExampleTests extends \PHPUnit_Framework_TestCase
{


    protected $client;

    protected function setUp()
    {
        $this->client = new GuzzleHttp\Client([
            'base_uri' => 'http://localhost:80/gretel/api/src/router.php/'
        ]);
    }

    public function testTestRoute()
    {
        $response = $this->client->get('test_route', null);
        $data = json_decode($response->getBody(), true);
        $this->assertEquals("test", $data["payload"]);


    }

}