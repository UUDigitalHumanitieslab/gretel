<?php

$treebanks = array();

$files = glob(__DIR__.'/*.php');
foreach ($files as $file) {
    if ($file != __FILE__)
        require_once($file);
}

class TreebankComponent {
    /** @var string         Unique ID of this component, usually contains the treebank's id as prefix. Doubles as the name of the basex database containing this component. */
    public $name;
    /** @var string         Optional: DisplayName for this component, defaults to the id */
    public $displayname;
    /** @var string         Optional: Description for this component, defaults to the displayname. */
    public $description;

    /** @var int|string     Optional: Number of sentences in this component. The number 0 is replaced by the string '?'. Defaults to '?' */
    public $sentences;
    /** @var int|string     Optional: Number of words in this component. The number 0 is replaced by the string '?'. Defaults to '?' */
    public $words;

    /** @var boolean        Optional: Disable searching for this component - defaults to false */
    public $disabled;

    /** @var string|null    Optional: The group this component is in. Only used when this component also defined a variant. Defaults to null. */
    public $group;
    /** @var string|null    Optional: The variant this component is in. Only used when this component also defined a variant. Defaults to null. */
    public $variant;

    /** @var string|null    Optional: The basex server address for this component. The main treebank server is used if this is unset. Defaults to null. */
    public $machine;
    /** @var int|null       Optional: The basex server port for this component. The main treebank server is used if this is unset. Defaults to null. */
    public $port;
    /** @var string|null    Optional: The basex username for this component. The main treebank server is used if this is unset. Defaults to null. */
    public $username;
    /** @var string|null    Optional: The basex password for this component. The main treebank server is used if this is unset. Defaults to null. */
    public $password;

    /**
     * @param string            $name
     * @param string            $databaseName
     * @param integer|string    $sentences
     * @param integer|string    $words
     * @param string            $group
     * @param string            $variant
     * @param boolean           $disabled
     * @param string|null       $machine
     * @param int|null          $port
     * @param string|null       $username
     * @param string|null       $password
     */
    public function __construct($name, $displayname = null, $sentences = 0, $words = 0, $description = null, $group = null, $variant = null, $disabled = false, $machine = null, $port = null, $username = null, $password = null) {
        $this->name = $name;
        $this->displayname = $displayname ?? $name;
        $this->description = $description ?? $displayname ?? $name;
        $this->sentences = $sentences;
        $this->words = $words;
        $this->sentences = $sentences;
        $this->disabled = $disabled;
        $this->group = $group && $variant ? $group : null;
        $this->variant = $group && $variant ? $variant : null;

        if (!($machine && $port != null && $username && $password)) {
            $machine = null;
            $port = null;
            $username = null;
            $password = null;
        }
        $this->machine = $machine;
        $this->port = $port;
        $this->username = $username;
        $this->password = $password;
    }
}

class TreebankMetadata {
    /** @var string     Name of this metadata field */
    public $field;
    /** @var string     Type of this field - 'text', 'int', 'date' */
    public $type;
    /** @var string     How to present this field in the UI - 'checkbox', 'slider', 'range', 'dropdown' */
    public $facet;
    /** @var boolean    Whether to show this metadata as a filter in the UI */
    public $show;

    /** @var int|string|null Optional: Lower bound for this field - only for type 'int' or 'date' */
    public $minvalue;
    /** @var int|string|null Optional: Upper bound for this field - only for type 'int' or 'date' */
    public $maxvalue;

    /**
     * @param string $field
     * @param string $type
     * @param string $facet
     * @param boolean $show
     * @param string|int|null $minvalue
     * @param string|int|null $maxvalue
     */
    public function __construct($field, $type, $facet, $show = true, $minvalue = null, $maxvalue = null) {
        if ($type !== 'text' && $type !== 'int' && $type !== 'date') {
            throw new Exception(`Metadata field $field has unknown type $type`);
        }
        if ($facet !== 'checkbox' && $facet !== 'slider' && $facet !== 'range' && $facet !== 'dropdown') {
            throw new Exception(`Metadata field $field has unknown facet type $facet`);
        }

        $this->field = $field;
        $this->type = $type;
        $this->facet = $facet;
        $this->show = $show;
        $this->minvalue = $minvalue;
        $this->maxvalue = $maxvalue;
    }
}

class TreebankInfo {
    /** @var string     Unique ID of this treebank */
    public $name;
    /** @var string     Optional: DisplayName for this bank - defaults to the id */
    public $displayname;


    /** @var string     Optional: Version (used in description) */
    public $version;
    /** @var string     Optional: Origin information (e.g. 'spoken') (used in description) */
    public $production;
    /** @var string     Optional: Language information (e.g. 'Dutch') */
    public $language;

    /** @var boolean    Optional: Allow searching multiple components simultaneously, defaults to true */
    public $multioption;

    /**
     * Optional: Mark this treebank as grinded - defaults to false
     *
     * For grinded corpora, every component exists as a regular database like, in a non-grinded treebanks,     * but also has a "grinded" version consisting of many hundreds of small databases.
     * These databases are retrieved through the sentence2treebank prefixed with the ID of the component.
     *
     * @var boolean
     */
    public $grinded;

    /** @var string     Optional: BaseX Server information, this can be overridden per component - defaults to 'localhost' */
    public $machine;
    /** @var string     Optional: BaseX Server information, this can be overridden per component - defaults to '1984' */
    public $port;
    /** @var string     Optional: BaseX Server information, this can be overridden per component - defaults to 'admin' */
    public $username;
    /** @var string     Optional: BaseX Server information, this can be overridden per component - defaults to 'admin' */
    public $password;

    /**
     * The components in this treebank.
     * Components are made available through $treebank->components['COMPONENT_ID'].
     *
     * The ID refers to the basex database that contains this component's information.
     * Disabled components are not required to actually exist on disk and can use a dummy id.
     *
     *
     * @var TreebankComponent[]
     */
    public $components;

    /**
     * Optional: Group details for this treebank - defaults to null.
     *
     * The groups are defined based on usage in the components in this bank,
     * but here you can define descriptions for each group.
     *
     * ```
     *  $treebank->groups = array(
     *      'Group1' => array(
     *          'description' => 'description here',
     *      ),
     *  )
     * ```
     *
     * @var array|null
     */
    public $groups;

    /**
     * Optional: Variant details for this treebank - defaults to null.
     *
     * The variants are defined based on usage in the components in this bank,
     * but here you can define display names for each variant.
     *
     * ```
     *  $treebank->variants = array(
     *      'variant1` => array(
     *          'displayname' => 'displayname here',
     *      ),
     *  )
     * ```
     *
     * @var array|null
     */
    public $variants;

    /** @var TreebankMetadata[]|null  Optional: Metadata present in this treebank's data and how to present them - defaults to null. */
    public $metadata;

    /** @param string  $v @return this */ public function setdisplayname($v) { $this->displayname = $v; return $this; }
    /** @param string  $v @return this */ public function setversion($v) { $this->version = $v; return $this; }
    /** @param string  $v @return this */ public function setproduction($v) { $this->production = $v; return $this; }
    /** @param string  $v @return this */ public function setlanguage($v) { $this->language = $v; return $this; }
    /** @param boolean $v @return this */ public function setmultioption($v) { $this->multioption = $v; return $this; }
    /** @param boolean $v @return this */ public function setgrinded($v) { $this->grinded = $v; return $this; }
    /** @param string  $v @return this */ public function setmachine($v) { $this->machine = $v; return $this; }
    /** @param string  $v @return this */ public function setport($v) { $this->port = $v; return $this; }
    /** @param string  $v @return this */ public function setusername($v) { $this->username = $v; return $this; }
    /** @param string  $v @return this */ public function setpassword($v) { $this->password = $v; return $this; }
    /** @param array   $v @return this */ public function setgroups($v) { $this->groups = $v; return $this; }
    /** @param array   $v @return this */ public function setvariants($v) { $this->variants = $v; return $this; }
    /** @param array   $v @return this */ public function setmetadata($v) { $this->metadata = $v; return $this; }

    /**
     * @param string    $name
     * @param TreebankComponent[] $components
     * @param string                $displayname
     * @param string                $version
     * @param string                $production
     * @param string                $language
     * @param boolean               $multioption
     * @param boolean               $grinded
     * @param string                $machine
     * @param int                   $port
     * @param string                $username
     * @param string                $password
     * @param array|null            $groups
     * @param array|null            $variants
     * @param array|null            $metadata
     */
    public function __construct(
        $name,
        array $components,

        $displayname = '',
        $version = '',
        $production = '',
        $language = '',

        $multioption = true,
        $grinded = false,

        $machine = 'localhost',
        $port = '1984',
        $username = 'admin',
        $password = 'admin',

        array $groups = null,
        array $variants = null,
        array $metadata = null
    ) {
        $displayname = $displayname ?: $name;

        $this->name         = $name;
        $this->displayname  = $displayname;
        $this->version      = $version;
        $this->production   = $production;
        $this->language     = $language;
        $this->multioption  = $multioption;
        $this->grinded      = $grinded;
        $this->machine      = $machine;
        $this->port         = $port;
        $this->username     = $username;
        $this->password     = $password;
        $this->components   = array_combine( // make sure all components can be accessed by their id
            array_map(function($comp) { return $comp->name; }, $components),
            $components
        );
        $this->groups       = $groups;
        $this->variants     = $variants;
        $this->metadata     = $metadata;

        // check required fields
        if (!$this->components || empty($this->components)) {
            throw new Exception(`Missing component definitions for treebank $name`);
        }

        // Every group should contain one component for every variant
        // Check this is this the case.
        // The component definitions are leading for determining which groups and variants exist
        // -- the 'components' and 'variants' in the initial config only
        //  contain displaynames/descriptions and are fully optional
        $allVariants = array();
        $allGroups = array();
        $hasGroups = false;
        // First - extract group & variant information, and record if there is any at all
        /** @var TreebankComponent $comp */
        foreach ($this->components as $comp) {
            $compId = $comp->name;
            $v = $comp->variant;
            $g = $comp->group;
            $hasGroups = $hasGroups || $v != null || $g != null;

            if (!$hasGroups) {
                continue;
            }

            if ($v == null || $g == null) {
                throw new Exception(`Component $compId in treebank $name is missing group or variant information`);
                return;
            }

            $allVariants[$v] = 1;
            $allGroups[$g] = $allGroups[$g] ?? array();
            $allGroups[$g][$v] = $compId;
        }

        // Validate all groups contain all variants
        // Also initialize missing group and variant displaynames/descriptions
        if ($hasGroups) {
            $groups     = $this->groups ?? array();
            $variants   = $this->variants ?? array();

            foreach ($allGroups as $groupId => $componentsByVariant) {
                foreach ($allVariants as $variantId => $_) {
                    if (!$componentsByVariant[$variantId]) {
                        throw new Exception(`Group $groupId is missing a component for variant $v in treebank $name`);
                    }
                }

                // Create an entry for this group if it doesn't exist yet
                $groups[$groupId] = $groups[$groupId] ?? array('description' => '');
            }

            // Create entries for any missing variants
            foreach ($allVariants as $variantId => $_) {
                $variants[$variantId] = $variants[$variantId] ?? array('displayname' => $variantId);
            }

            $this->groups = $groups;
            $this->variants = $variants;
        } else {
            $this->groups = null;
            $this->variants = null;
        }
    }
}

function registerTreebank(TreebankInfo $treebank) {
    /** @var TreebankInfo[] $treebanks */
    global $treebanks;
    $treebanks[$treebank->name] = $treebank;
}

?>