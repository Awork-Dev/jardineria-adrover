// Guía verde: plantas, calendario, doctor de plantas, xerojardinería y planta del mes.

// ===== Guía verde: datos =====
// Plantas: [latín, luz ("sol"|"semi"|"sombra", varias separadas por espacio), riego ("bajo"|"medio"|"alto"), mascotas ("si"|"no"|"?"), autóctona de Baleares, foto opcional, textos {lang:[nombre, consejo]}]
export const PLANTAS_G = [
  ["Salvia rosmarinus", "sol", "bajo", "si", true, {
    es: ["Romero", "Aguanta sol pleno, viento y sequía. Florece en invierno y es un imán para las abejas. Evita el encharcamiento."],
    ca: ["Romaní", "Aguanta sol ple, vent i sequera. Floreix a l'hivern i atreu moltíssim les abelles. Evita l'entollament."],
    en: ["Rosemary", "Takes full sun, wind and drought. Flowers in winter and is a magnet for bees. Avoid waterlogging."],
    de: ["Rosmarin", "Verträgt volle Sonne, Wind und Trockenheit. Blüht im Winter und lockt Bienen an. Staunässe vermeiden."] }],
  ["Pistacia lentiscus", "sol semi", "bajo", "?", true, {
    es: ["Lentisco (mata)", "Arbusto autóctono muy resistente, ideal para setos informales y zonas sin riego una vez establecido."],
    ca: ["Mata (llentiscle)", "Arbust autòcton molt resistent, ideal per a tanques informals i zones sense reg un cop establert."],
    en: ["Mastic tree", "Very hardy native shrub, ideal for informal hedges and unwatered areas once established."],
    de: ["Mastixstrauch", "Sehr robuster heimischer Strauch, ideal für natürliche Hecken und Flächen ohne Bewässerung."] }],
  ["Olea europaea var. sylvestris", "sol", "bajo", "si", true, {
    es: ["Acebuche", "El olivo silvestre de las islas. Admite poda de formación y crece en suelos pobres y calizos."],
    ca: ["Ullastre", "L'olivera silvestre de les illes. Admet poda de formació i creix en sòls pobres i calcaris."],
    en: ["Wild olive", "The islands' wild olive. Takes formative pruning and grows in poor, limy soils."],
    de: ["Wilder Ölbaum", "Der wilde Olivenbaum der Inseln. Verträgt Formschnitt und wächst auf kargen, kalkhaltigen Böden."] }],
  ["Chamaerops humilis", "sol semi", "bajo", "si", true, {
    es: ["Palmito", "La única palmera autóctona de Europa. Muy resistente a la sequía y menos afectada por el picudo rojo."],
    ca: ["Garballó", "L'única palmera autòctona d'Europa. Molt resistent a la sequera i menys afectada pel morrut."],
    en: ["Dwarf fan palm", "Europe's only native palm. Very drought tolerant and less affected by the red palm weevil."],
    de: ["Zwergpalme", "Die einzige heimische Palme Europas. Sehr trockenheitsresistent, weniger anfällig für den Palmrüssler."] }],
  ["Myrtus communis", "sol semi", "bajo", "?", true, {
    es: ["Mirto", "Arbusto aromático de flor blanca en verano. Admite recorte y sirve para setos bajos."],
    ca: ["Murta", "Arbust aromàtic de flor blanca a l'estiu. Admet retall i serveix per a tanques baixes."],
    en: ["Myrtle", "Aromatic shrub with white summer flowers. Takes clipping and suits low hedges."],
    de: ["Myrte", "Aromatischer Strauch mit weißen Sommerblüten. Schnittverträglich, gut für niedrige Hecken."] }],
  ["Cistus albidus", "sol", "bajo", "?", true, {
    es: ["Jara blanca (estepa)", "Flores rosas en primavera y hojas grises que resisten el calor. Necesita buen drenaje."],
    ca: ["Estepa blanca", "Flors roses a la primavera i fulles grises que resisteixen la calor. Necessita bon drenatge."],
    en: ["Grey-leaved cistus", "Pink spring flowers and grey heat-proof leaves. Needs good drainage."],
    de: ["Weißliche Zistrose", "Rosa Frühlingsblüten und graue, hitzefeste Blätter. Braucht gute Drainage."] }],
  ["Ceratonia siliqua", "sol", "bajo", "?", true, {
    es: ["Algarrobo", "Árbol tradicional de Mallorca, da buena sombra y apenas necesita riego cuando está arraigado."],
    ca: ["Garrover", "Arbre tradicional de Mallorca, fa bona ombra i gairebé no necessita reg quan està arrelat."],
    en: ["Carob tree", "A traditional Majorcan tree that gives good shade and needs little water once rooted."],
    de: ["Johannisbrotbaum", "Traditioneller Baum Mallorcas, spendet Schatten und braucht eingewurzelt kaum Wasser."] }],
  ["Lavandula angustifolia / dentata", "sol", "bajo", "no", false, {
    es: ["Lavanda", "Sol y suelo bien drenado. Pódala ligeramente tras la floración para que no se abra. Tóxica para perros y gatos si la comen."],
    ca: ["Espígol (lavanda)", "Sol i sòl ben drenat. Poda-la lleugerament després de la floració perquè no s'obri. Tòxica per a cans i moixos si la mengen."],
    en: ["Lavender", "Sun and well-drained soil. Trim lightly after flowering to keep it compact. Toxic to dogs and cats if eaten."],
    de: ["Lavendel", "Sonne und durchlässiger Boden. Nach der Blüte leicht zurückschneiden. Giftig für Hunde und Katzen."] }],
  ["Nerium oleander", "sol", "bajo", "no", false, {
    es: ["Adelfa", "Muy resistente al calor y la sequía, pero toda la planta es muy tóxica para personas y animales."],
    ca: ["Baladre", "Molt resistent a la calor i la sequera, però tota la planta és molt tòxica per a persones i animals."],
    en: ["Oleander", "Very heat and drought tolerant, but every part is highly toxic to people and animals."],
    de: ["Oleander", "Sehr hitze- und trockenheitsresistent, aber alle Teile sind für Mensch und Tier stark giftig."] }],
  ["Gazania rigens", "sol", "bajo", "si", false, {
    es: ["Gazania", "Tapizante de flores vivas que se abren con el sol. Perfecta para taludes y jardineras soleadas."],
    ca: ["Gatzània", "Entapissant de flors vives que s'obren amb el sol. Perfecta per a talussos i jardineres assolellades."],
    en: ["Gazania", "Ground cover with bright flowers that open in the sun. Great for banks and sunny planters."],
    de: ["Gazanie", "Bodendecker mit leuchtenden Blüten, die sich in der Sonne öffnen. Ideal für Böschungen."] }],
  ["Pelargonium spp.", "sol semi", "medio", "no", false, {
    es: ["Geranio", "Clásico de balcón. Riega cuando la tierra esté seca y vigila la mariposa del geranio en verano. Tóxico para mascotas."],
    ca: ["Gerani (anyorat)", "Clàssic de balcó. Rega quan la terra estigui seca i vigila la papallona del gerani a l'estiu. Tòxic per a mascotes."],
    en: ["Geranium", "A balcony classic. Water when the soil is dry and watch for the geranium bronze butterfly in summer. Toxic to pets."],
    de: ["Geranie", "Balkonklassiker. Gießen, wenn die Erde trocken ist; im Sommer auf den Pelargonien-Bläuling achten. Giftig für Haustiere."] }],
  ["Hibiscus rosa-sinensis", "sol", "medio", "si", false, {
    es: ["Hibisco", "Flor grande todo el verano. Le gusta el sol y el riego regular; protégelo del frío en invierno."],
    ca: ["Hibisc", "Flor grossa tot l'estiu. Li agrada el sol i el reg regular; protegeix-lo del fred a l'hivern."],
    en: ["Hibiscus", "Large flowers all summer. Likes sun and regular watering; protect it from cold in winter."],
    de: ["Hibiskus", "Große Blüten den ganzen Sommer. Mag Sonne und regelmäßiges Gießen; im Winter vor Kälte schützen."] }],
  ["Trachelospermum jasminoides", "sol semi", "medio", "si", false, {
    es: ["Jazmín estrellado", "Trepadora perenne muy perfumada en primavera. Ideal para vallas y pérgolas."],
    ca: ["Gessamí estrellat", "Enfiladissa perenne molt perfumada a la primavera. Ideal per a tanques i pèrgoles."],
    en: ["Star jasmine", "Evergreen climber with a strong spring scent. Ideal for fences and pergolas."],
    de: ["Sternjasmin", "Immergrüne, im Frühling stark duftende Kletterpflanze. Ideal für Zäune und Pergolen."] }],
  ["Citrus × limon", "sol", "medio", "no", false, {
    es: ["Limonero", "Riego regular y abonado en primavera. En suelos calizos puede amarillear: aporta quelato de hierro."],
    ca: ["Llimoner", "Reg regular i adob a la primavera. En sòls calcaris pot groguejar: aporta quelat de ferro."],
    en: ["Lemon tree", "Regular watering and spring feeding. On limy soils leaves may yellow: add iron chelate."],
    de: ["Zitronenbaum", "Regelmäßig gießen, im Frühjahr düngen. Auf Kalkböden gelbe Blätter: Eisenchelat geben."] }],
  ["Aloe vera", "sol semi", "bajo", "no", false, {
    es: ["Aloe vera", "Riego escaso y sustrato muy drenante. Tóxico para perros y gatos."],
    ca: ["Àloe vera", "Reg escàs i substrat molt drenant. Tòxic per a cans i moixos."],
    en: ["Aloe vera", "Little water and very free-draining soil. Toxic to dogs and cats."],
    de: ["Aloe vera", "Wenig Wasser und sehr durchlässiges Substrat. Giftig für Hunde und Katzen."] }],
  ["Chlorophytum comosum", "semi sombra", "medio", "si", false, {
    es: ["Cinta", "Planta de interior casi indestructible y segura para mascotas. Luz indirecta y riego moderado."],
    ca: ["Cinta", "Planta d'interior gairebé indestructible i segura per a mascotes. Llum indirecta i reg moderat."],
    en: ["Spider plant", "An almost indestructible, pet-safe houseplant. Indirect light and moderate watering."],
    de: ["Grünlilie", "Fast unverwüstliche, haustierfreundliche Zimmerpflanze. Indirektes Licht, mäßig gießen."] }],
  ["Calathea spp.", "sombra", "alto", "si", false, {
    es: ["Calathea", "Interior con luz suave y ambiente húmedo. Segura para mascotas. Usa agua sin cal si puedes."],
    ca: ["Calathea", "Interior amb llum suau i ambient humit. Segura per a mascotes. Fes servir aigua sense calç si pots."],
    en: ["Calathea", "Indoors with soft light and humidity. Pet-safe. Use lime-free water if you can."],
    de: ["Calathea", "Drinnen bei sanftem Licht und hoher Luftfeuchte. Haustierfreundlich. Möglichst kalkfreies Wasser."] }],
  ["Epipremnum aureum", "semi sombra", "medio", "no", false, {
    es: ["Potus", "Aguanta poca luz y olvidos de riego. Tóxico para perros y gatos."],
    ca: ["Potus", "Aguanta poca llum i oblits de reg. Tòxic per a cans i moixos."],
    en: ["Pothos", "Copes with low light and missed watering. Toxic to dogs and cats."],
    de: ["Efeutute", "Verträgt wenig Licht und vergessenes Gießen. Giftig für Hunde und Katzen."] }],
  ["Dracaena trifasciata (Sansevieria)", "sol semi sombra", "bajo", "no", false, {
    es: ["Sansevieria", "La planta de interior más sufrida: riega solo cuando la tierra esté totalmente seca. Tóxica para mascotas."],
    ca: ["Sansevieria (llengua de sogra)", "La planta d'interior més sofrida: rega només quan la terra estigui ben seca. Tòxica per a mascotes."],
    en: ["Snake plant", "The toughest houseplant: water only when the soil is completely dry. Toxic to pets."],
    de: ["Bogenhanf", "Die genügsamste Zimmerpflanze: nur gießen, wenn die Erde ganz trocken ist. Giftig für Haustiere."] }],
  ["Monstera deliciosa", "semi sombra", "medio", "no", false, {
    es: ["Monstera", "Luz abundante pero indirecta y riego cuando se seque la capa superior. Tóxica para mascotas."],
    ca: ["Monstera", "Llum abundant però indirecta i reg quan s'assequi la capa superior. Tòxica per a mascotes."],
    en: ["Monstera", "Bright indirect light; water when the top layer dries. Toxic to pets."],
    de: ["Monstera", "Hell, aber indirekt; gießen, wenn die oberste Schicht trocken ist. Giftig für Haustiere."] }],
["Pinus halepensis", "sol", "bajo", "?", true, {
  es: ["Pino carrasco", "El pino de las islas. Da sombra sin riego. Entre enero y abril vigila la procesionaria: sus pelos son muy peligrosos para perros y niños."],
  ca: ["Pi blanc", "El pi de les illes. Fa ombra sense reg. Entre gener i abril vigila la processionària: els seus pèls són molt perillosos per a cans i infants."],
  en: ["Aleppo pine", "The islands' pine. Gives shade without watering. From January to April watch for processionary caterpillars: their hairs are very dangerous for dogs and children."],
  de: ["Aleppo-Kiefer", "Die Kiefer der Inseln. Spendet Schatten ohne Bewässerung. Von Januar bis April auf Prozessionsspinner achten: ihre Haare sind sehr gefährlich für Hunde und Kinder."] }],
  ["Phlomis italica", "sol", "bajo", "?", true, {
  es: ["Estepa blenera", "Endemismo de Baleares, de hojas plateadas y flores rosas en primavera. Perfecta para jardines de bajo consumo."],
  ca: ["Estepa blenera", "Endemisme de les Balears, de fulles platejades i flors roses a la primavera. Perfecta per a jardins de baix consum."],
  en: ["Balearic sage", "Endemic to the Balearics, with silvery leaves and pink flowers in spring. Perfect for low-water gardens."],
  de: ["Balearen-Brandkraut", "Endemisch auf den Balearen, mit silbrigen Blättern und rosa Blüten im Frühling. Ideal für wassersparende Gärten."] }],
  ["Thymus vulgaris", "sol", "bajo", "si", false, {
  es: ["Tomillo", "Aromática de sol y poca agua, ideal para bordes y rocallas. Recórtala tras la floración para que no se vuelva leñosa."],
  ca: ["Farigola", "Aromàtica de sol i poca aigua, ideal per a vores i rocalles. Retalla-la després de florir perquè no es torni llenyosa."],
  en: ["Thyme", "A sun-loving, low-water herb, ideal for edges and rockeries. Trim after flowering so it doesn't turn woody."],
  de: ["Thymian", "Sonnenliebendes, genügsames Kraut für Beetränder und Steingärten. Nach der Blüte zurückschneiden, damit er nicht verholzt."] }],
  ["Rosa spp.", "sol", "medio", "si", false, {
  es: ["Rosal", "Sol directo, riego regular al pie y abonado en primavera. Poda fuerte en enero y quita las flores secas para que repita."],
  ca: ["Roser", "Sol directe, reg regular al peu i adob a la primavera. Poda forta al gener i lleva les flors seques perquè repeteixi."],
  en: ["Rose", "Full sun, regular watering at the base and feeding in spring. Hard prune in January and deadhead to keep it flowering."],
  de: ["Rose", "Volle Sonne, regelmäßig am Fuß gießen und im Frühjahr düngen. Im Januar kräftig schneiden und Verblühtes entfernen."] }],
  ["Bougainvillea spectabilis", "sol", "bajo", "?", false, {
  es: ["Buganvilla", "Trepadora de color intenso de mayo a noviembre. Cuanto más sol y menos riego, más flor. Tiene espinas: guíala con cuidado."],
  ca: ["Buguenvíl·lea", "Enfiladissa de color intens de maig a novembre. Com més sol i menys reg, més flor. Té espines: guia-la amb compte."],
  en: ["Bougainvillea", "An intensely coloured climber from May to November. More sun and less water mean more flowers. It has thorns: train it carefully."],
  de: ["Bougainvillea", "Kletterpflanze in kräftigen Farben von Mai bis November. Mehr Sonne und weniger Wasser bringen mehr Blüten. Hat Dornen: vorsichtig leiten."] }],
  ["Plumbago auriculata", "sol semi", "bajo", "?", false, {
  es: ["Jazmín azul (plumbago)", "Flor azul cielo casi todo el año. Arbusto muy agradecido para setos y vallas; pódalo a finales de invierno."],
  ca: ["Gessamí blau (plumbago)", "Flor blau cel gairebé tot l'any. Arbust molt agraït per a bardisses i tanques; poda'l a final d'hivern."],
  en: ["Cape leadwort (plumbago)", "Sky-blue flowers almost all year. A rewarding shrub for hedges and fences; prune it in late winter."],
  de: ["Bleiwurz (Plumbago)", "Himmelblaue Blüten fast das ganze Jahr. Dankbarer Strauch für Hecken und Zäune; im Spätwinter schneiden."] }],
  ["Strelitzia reginae", "sol semi", "medio", "no", false, {
    es: ["Ave del paraíso", "Flor exótica naranja y azul en invierno y primavera. En el exterior necesita un rincón sin heladas; en maceta, mucha luz."],
    ca: ["Au del paradís", "Flor exòtica taronja i blava a l'hivern i la primavera. A l'exterior necessita un racó sense gelades; en test, molta llum."],
    en: ["Bird of paradise", "An exotic orange-and-blue flower in winter and spring. Outdoors it needs a frost-free spot; in a pot, lots of light."],
    de: ["Paradiesvogelblume", "Exotische orange-blaue Blüte im Winter und Frühling. Draußen braucht sie einen frostfreien Platz, im Topf viel Licht."] }],
    ["Agave americana", "sol", "bajo", "no", false, {
    es: ["Pita (agave)", "Escultural y casi sin riego. Sus puntas pinchan mucho: plántala lejos de caminos y zonas de juego. Su savia irrita."],
    ca: ["Pita (atzavara)", "Escultural i gairebé sense reg. Les seves puntes punxen molt: planta-la lluny de camins i zones de joc. La saba irrita."],
    en: ["Century plant (agave)", "Sculptural and almost water-free. Its tips are very sharp: plant it away from paths and play areas. The sap is irritating."],
    de: ["Agave", "Skulptural und fast ohne Wasser. Die Spitzen stechen stark: fern von Wegen und Spielbereichen pflanzen. Der Saft reizt."] }],
    ["Euphorbia pulcherrima", "semi", "medio", "no", false, {
    es: ["Flor de Pascua", "La planta de la Navidad. Luz abundante sin sol directo, lejos de corrientes y radiadores, y riego solo cuando la tierra se seque."],
    ca: ["Flor de Nadal", "La planta de Nadal. Llum abundant sense sol directe, lluny de corrents i radiadors, i reg només quan la terra s'assequi."],
    en: ["Poinsettia", "The Christmas plant. Bright light without direct sun, away from draughts and radiators; water only when the soil dries."],
    de: ["Weihnachtsstern", "Die Weihnachtspflanze. Hell, aber ohne direkte Sonne, fern von Zugluft und Heizung; nur gießen, wenn die Erde trocken ist."] }],
    ["Zamioculcas zamiifolia", "semi sombra", "bajo", "no", false, {
    es: ["Zamioculca", "Interior casi indestructible: aguanta poca luz y semanas sin riego. Riega solo cuando la tierra esté seca del todo."],
    ca: ["Zamioculca", "Interior gairebé indestructible: aguanta poca llum i setmanes sense reg. Rega només quan la terra estigui ben seca."],
    en: ["ZZ plant", "An almost indestructible houseplant: copes with low light and weeks without water. Water only when the soil is fully dry."],
    de: ["Glücksfeder", "Fast unverwüstliche Zimmerpflanze: verträgt wenig Licht und wochenlang kein Wasser. Nur gießen, wenn die Erde ganz trocken ist."] }],
    ["Spathiphyllum wallisii", "semi sombra", "medio", "no", false, {
    es: ["Espatifilo", "Flores blancas en interior con poca luz. Te avisa cuando tiene sed bajando las hojas. Agradece la humedad ambiental."],
    ca: ["Espatifil", "Flors blanques a l'interior amb poca llum. T'avisa quan té set abaixant les fulles. Agraeix la humitat ambiental."],
    en: ["Peace lily", "White flowers indoors in low light. It droops its leaves to tell you it's thirsty. Enjoys humid air."],
    de: ["Einblatt", "Weiße Blüten drinnen bei wenig Licht. Lässt die Blätter hängen, wenn sie Durst hat. Mag hohe Luftfeuchtigkeit."] }],
    ];
// Calendario (clima de Mallorca): 12 meses × tareas
export const CAL_G = {
  es: [
    ["Poda de frutales de hoja caduca y rosales", "Plantar árboles y frutales a raíz desnuda", "Proteger del frío las plantas sensibles"],
    ["Abonado de fondo en parterres y frutales", "Terminar la poda de rosales", "Semilleros protegidos de tomate y pimiento"],
    ["Poner a punto el riego antes del calor", "Plantar flor de primavera", "Tratamientos preventivos contra el picudo rojo en palmeras (de marzo a octubre)"],
    ["Plantar el huerto de verano: tomate, calabacín, berenjena", "Sembrar o resembrar césped", "Vigilar el pulgón en brotes tiernos"],
    ["Acolchar el suelo para ahorrar agua", "Ajustar el programador de riego", "Poda ligera de arbustos tras la floración"],
    ["Regar al amanecer o al anochecer", "Cortar el césped un poco más alto", "Vigilar la araña roja y la mariposa del geranio"],
    ["Riegos profundos y espaciados", "Evitar podas fuertes con el calor", "Dar sombra a las macetas y plantas delicadas"],
    ["Mantener el riego y revisar goteros", "Preparar semilleros de otoño: coles, lechugas", "Dejar el riego programado si te vas de vacaciones"],
    ["Resembrar y recuperar el césped", "Empezar a plantar arbustos mediterráneos", "Plantar el huerto de otoño e invierno"],
    ["El mejor mes para plantar árboles y arbustos con las lluvias", "Plantar bulbos de primavera", "Reducir el riego"],
    ["Plantar especies autóctonas", "Recoger hojas para el compost", "Revisar desagües y árboles tras las tormentas"],
    ["Poda de formación de árboles en reposo", "Proteger del frío y del viento", "Planificar el jardín del año que viene"],
  ],
  ca: [
    ["Poda de fruiters de fulla caduca i rosers", "Plantar arbres i fruiters a arrel nua", "Protegir del fred les plantes sensibles"],
    ["Adob de fons a parterres i fruiters", "Acabar la poda de rosers", "Planters protegits de tomàtiga i pebre"],
    ["Posar a punt el reg abans de la calor", "Plantar flor de primavera", "Tractaments preventius contra el morrut a les palmeres (de març a octubre)"],
    ["Plantar l'hort d'estiu: tomàtiga, carabassó, albergínia", "Sembrar o resembrar gespa", "Vigilar el pugó als brots tendres"],
    ["Encoixinar el sòl per estalviar aigua", "Ajustar el programador de reg", "Poda lleugera d'arbusts després de la floració"],
    ["Regar a trenc d'alba o al vespre", "Tallar la gespa una mica més alta", "Vigilar l'aranya vermella i la papallona del gerani"],
    ["Regs profunds i espaiats", "Evitar podes fortes amb la calor", "Fer ombra als testos i plantes delicades"],
    ["Mantenir el reg i revisar els degoters", "Preparar planters de tardor: cols, lletugues", "Deixar el reg programat si te'n vas de vacances"],
    ["Resembrar i recuperar la gespa", "Començar a plantar arbusts mediterranis", "Plantar l'hort de tardor i hivern"],
    ["El millor mes per plantar arbres i arbusts amb les pluges", "Plantar bulbs de primavera", "Reduir el reg"],
    ["Plantar espècies autòctones", "Recollir fulles per al compost", "Revisar desguassos i arbres després de les tempestes"],
    ["Poda de formació d'arbres en repòs", "Protegir del fred i del vent", "Planificar el jardí de l'any que ve"],
  ],
  en: [
    ["Prune deciduous fruit trees and roses", "Plant bare-root trees and fruit trees", "Protect tender plants from cold"],
    ["Base feeding for beds and fruit trees", "Finish pruning roses", "Start tomato and pepper seedlings under cover"],
    ["Service the irrigation before the heat", "Plant spring flowers", "Preventive red palm weevil treatments on palms (March to October)"],
    ["Plant the summer vegetable garden: tomato, courgette, aubergine", "Sow or overseed lawns", "Watch for aphids on new shoots"],
    ["Mulch the soil to save water", "Adjust the irrigation timer", "Light pruning of shrubs after flowering"],
    ["Water at dawn or dusk", "Mow the lawn a little higher", "Watch for spider mite and geranium butterfly"],
    ["Deep, less frequent watering", "Avoid hard pruning in the heat", "Shade pots and delicate plants"],
    ["Keep watering and check drippers", "Prepare autumn seedlings: cabbages, lettuces", "Set the timer if you go on holiday"],
    ["Overseed and repair the lawn", "Start planting Mediterranean shrubs", "Plant the autumn and winter vegetable garden"],
    ["Best month to plant trees and shrubs with the rains", "Plant spring bulbs", "Reduce watering"],
    ["Plant native species", "Collect leaves for compost", "Check drains and trees after storms"],
    ["Formative pruning of dormant trees", "Protect from cold and wind", "Plan next year's garden"],
  ],
  de: [
    ["Laubabwerfende Obstbäume und Rosen schneiden", "Wurzelnackte Bäume und Obstbäume pflanzen", "Empfindliche Pflanzen vor Kälte schützen"],
    ["Grunddüngung für Beete und Obstbäume", "Rosenschnitt abschließen", "Tomaten und Paprika geschützt vorziehen"],
    ["Bewässerung vor der Hitze prüfen", "Frühlingsblumen pflanzen", "Vorbeugende Behandlung gegen den Palmrüssler (März bis Oktober)"],
    ["Sommergemüse pflanzen: Tomate, Zucchini, Aubergine", "Rasen säen oder nachsäen", "Auf Blattläuse an jungen Trieben achten"],
    ["Boden mulchen, um Wasser zu sparen", "Bewässerungscomputer anpassen", "Sträucher nach der Blüte leicht schneiden"],
    ["Morgens früh oder abends gießen", "Rasen etwas höher mähen", "Auf Spinnmilben und Pelargonien-Bläuling achten"],
    ["Tief und seltener gießen", "Keine starken Schnitte bei Hitze", "Töpfe und empfindliche Pflanzen beschatten"],
    ["Weiter gießen und Tropfer prüfen", "Herbstgemüse vorziehen: Kohl, Salat", "Bewässerung vor dem Urlaub programmieren"],
    ["Rasen nachsäen und erneuern", "Mediterrane Sträucher pflanzen", "Herbst- und Wintergemüse pflanzen"],
    ["Bester Monat, um mit dem Regen Bäume und Sträucher zu pflanzen", "Frühlingszwiebeln (Blumenzwiebeln) setzen", "Bewässerung reduzieren"],
    ["Heimische Arten pflanzen", "Laub für den Kompost sammeln", "Abflüsse und Bäume nach Stürmen prüfen"],
    ["Erziehungsschnitt ruhender Bäume", "Vor Kälte und Wind schützen", "Den Garten fürs nächste Jahr planen"],
  ],
};
// Doctor de plantas: [síntoma, causa probable, qué hacer]
export const DOC_G = {
  es: [
    ["Hojas amarillas con los nervios verdes", "Clorosis férrica: muy habitual en los suelos calizos de Mallorca. La planta no puede absorber el hierro.", "Aporta quelato de hierro y, si puedes, materia orgánica. Riega con agua menos calcárea en macetas."],
    ["Hojas amarillas y caídas, tierra siempre húmeda", "Exceso de riego o mal drenaje; las raíces se asfixian.", "Deja secar la tierra antes de volver a regar y revisa que la maceta tenga agujeros de drenaje."],
    ["Puntas y bordes secos y marrones", "Falta de agua, sol o viento excesivo, o acumulación de sales.", "Riega en profundidad y con menos frecuencia, acolcha el suelo y lava el sustrato de las macetas con agua abundante de vez en cuando."],
    ["Polvo blanco sobre las hojas", "Oídio, un hongo que aparece con calor y humedad.", "Retira las hojas más afectadas, mejora la ventilación y trata con azufre fuera de las horas de calor."],
    ["Hojas pegajosas o con manchas negras", "Pulgón, cochinilla o mosca blanca; la mancha negra es la negrilla que crece sobre la melaza.", "Lava con agua y jabón potásico y repite el tratamiento a los 7 días. Revisa el envés de las hojas."],
    ["Punteado claro y telarañas finas", "Araña roja, frecuente con calor seco.", "Pulveriza agua en el envés de las hojas y trata con un acaricida específico si persiste."],
    ["Agujeros en las hojas o flores comidas", "Orugas, caracoles o babosas.", "Revisa al anochecer y retíralos a mano. Para orugas, usa Bacillus thuringiensis."],
    ["Palmera con el cogollo caído o las hojas centrales torcidas", "Posible picudo rojo, una plaga muy grave en Baleares.", "Avísanos cuanto antes: la palmera necesita una revisión profesional y un tratamiento inmediato."],
    ["Olivo, almendro o adelfa con ramas secas y hojas quemadas por los bordes", "Puede ser Xylella fastidiosa, presente en Baleares desde 2016.", "No muevas restos ni plantas. Consúltanos y comunícalo al servicio de sanidad vegetal del Govern."],
  ],
  ca: [
    ["Fulles grogues amb els nervis verds", "Clorosi fèrrica: molt habitual als sòls calcaris de Mallorca. La planta no pot absorbir el ferro.", "Aporta quelat de ferro i, si pots, matèria orgànica. Als testos, rega amb aigua menys calcària."],
    ["Fulles grogues que cauen, terra sempre humida", "Excés de reg o mal drenatge; les arrels s'ofeguen.", "Deixa assecar la terra abans de tornar a regar i comprova que el test tingui forats de drenatge."],
    ["Puntes i vores seques i marrons", "Falta d'aigua, sol o vent excessiu, o acumulació de sals.", "Rega en profunditat i amb menys freqüència, encoixina el sòl i renta de tant en tant el substrat dels testos amb aigua abundant."],
    ["Pols blanca sobre les fulles", "Oïdi, un fong que apareix amb calor i humitat.", "Retira les fulles més afectades, millora la ventilació i tracta amb sofre fora de les hores de calor."],
    ["Fulles enganxoses o amb taques negres", "Pugó, cotonet o mosca blanca; la taca negra és la negreta que creix sobre la melassa.", "Renta amb aigua i sabó potàssic i repeteix el tractament als 7 dies. Revisa el revers de les fulles."],
    ["Puntejat clar i teranyines fines", "Aranya vermella, freqüent amb calor seca.", "Polvoritza aigua al revers de les fulles i tracta amb un acaricida específic si persisteix."],
    ["Forats a les fulles o flors menjades", "Erugues, caragols o llimacs.", "Revisa al vespre i retira'ls a mà. Per a les erugues, fes servir Bacillus thuringiensis."],
    ["Palmera amb el cabdell caigut o les fulles centrals torçades", "Possible morrut (picudo rojo), una plaga molt greu a les Balears.", "Avisa'ns com més aviat millor: la palmera necessita una revisió professional i un tractament immediat."],
    ["Olivera, ametller o baladre amb branques seques i fulles cremades per les vores", "Pot ser Xylella fastidiosa, present a les Balears des de 2016.", "No moguis restes ni plantes. Consulta'ns i comunica-ho al servei de sanitat vegetal del Govern."],
  ],
  en: [
    ["Yellow leaves with green veins", "Iron chlorosis: very common on Mallorca's limy soils. The plant can't take up iron.", "Apply iron chelate and add organic matter if you can. Use less limy water for pots."],
    ["Yellow, falling leaves and constantly wet soil", "Overwatering or poor drainage; the roots are suffocating.", "Let the soil dry before watering again and make sure the pot has drainage holes."],
    ["Dry brown tips and edges", "Lack of water, too much sun or wind, or salt build-up.", "Water deeply but less often, mulch the soil and flush pot compost with plenty of water now and then."],
    ["White powder on the leaves", "Powdery mildew, a fungus that thrives in warm, humid weather.", "Remove the worst leaves, improve air flow and treat with sulphur outside the hottest hours."],
    ["Sticky leaves or black patches", "Aphids, mealybugs or whitefly; the black film is sooty mould growing on honeydew.", "Wash with water and potassium soap and repeat after 7 days. Check the undersides of leaves."],
    ["Pale speckling and fine webs", "Spider mites, common in hot, dry weather.", "Mist the undersides of leaves and use a specific miticide if it persists."],
    ["Holes in leaves or eaten flowers", "Caterpillars, snails or slugs.", "Check at dusk and remove them by hand. For caterpillars, use Bacillus thuringiensis."],
    ["Palm with a drooping crown or twisted central leaves", "Possibly red palm weevil, a very serious pest in the Balearics.", "Contact us as soon as possible: the palm needs a professional check and immediate treatment."],
    ["Olive, almond or oleander with dead branches and scorched leaf edges", "It may be Xylella fastidiosa, present in the Balearics since 2016.", "Don't move cuttings or plants. Ask us and report it to the regional plant health service."],
  ],
  de: [
    ["Gelbe Blätter mit grünen Adern", "Eisenchlorose: auf Mallorcas Kalkböden sehr häufig. Die Pflanze kann kein Eisen aufnehmen.", "Eisenchelat geben und nach Möglichkeit organisches Material einarbeiten. Topfpflanzen mit kalkärmerem Wasser gießen."],
    ["Gelbe, fallende Blätter bei ständig nasser Erde", "Zu viel Wasser oder schlechte Drainage; die Wurzeln ersticken.", "Erde vor dem nächsten Gießen abtrocknen lassen und prüfen, ob der Topf Abzugslöcher hat."],
    ["Trockene braune Spitzen und Ränder", "Wassermangel, zu viel Sonne oder Wind oder Salzablagerungen.", "Seltener, aber durchdringend gießen, mulchen und das Topfsubstrat ab und zu kräftig durchspülen."],
    ["Weißer Belag auf den Blättern", "Echter Mehltau, ein Pilz, der bei Wärme und Feuchtigkeit auftritt.", "Stark befallene Blätter entfernen, für Luft sorgen und außerhalb der Mittagshitze mit Schwefel behandeln."],
    ["Klebrige Blätter oder schwarzer Belag", "Blattläuse, Schildläuse oder Weiße Fliege; der schwarze Belag ist Rußtau auf dem Honigtau.", "Mit Wasser und Kaliseife abwaschen, nach 7 Tagen wiederholen. Blattunterseiten kontrollieren."],
    ["Helle Sprenkel und feine Gespinste", "Spinnmilben, häufig bei trockener Hitze.", "Blattunterseiten besprühen und bei anhaltendem Befall ein Akarizid verwenden."],
    ["Löcher in Blättern oder angefressene Blüten", "Raupen, Schnecken oder Nacktschnecken.", "Abends kontrollieren und absammeln. Gegen Raupen Bacillus thuringiensis verwenden."],
    ["Palme mit hängender Krone oder verdrehten Herzblättern", "Möglicherweise Roter Palmrüssler, ein sehr ernster Schädling auf den Balearen.", "Melden Sie sich schnell bei uns: Die Palme braucht eine fachliche Kontrolle und sofortige Behandlung."],
    ["Olive, Mandel oder Oleander mit dürren Ästen und verbrannten Blatträndern", "Es könnte Xylella fastidiosa sein, seit 2016 auf den Balearen.", "Kein Schnittgut und keine Pflanzen bewegen. Fragen Sie uns und melden Sie es dem Pflanzenschutzdienst der Regierung."],
  ],
};
// Xerojardinería: 7 principios [título, texto]
export const XERO_G = {
  es: [["Diseña por zonas de riego", "Agrupa las plantas según el agua que necesitan para no regar de más."], ["Mejora el suelo", "Un suelo con materia orgánica retiene mejor el agua."], ["Menos césped", "Reserva el césped para donde se usa y cambia el resto por tapizantes o grava."], ["Plantas adaptadas", "Especies autóctonas y mediterráneas que viven con el clima de las islas."], ["Riego eficiente", "Goteo, programador y riego al amanecer o al anochecer."], ["Acolchado", "Corteza, grava o restos de poda triturados reducen la evaporación y las malas hierbas."], ["Mantenimiento justo", "Poda y abona solo lo necesario: una planta forzada pide más agua."]],
  ca: [["Dissenya per zones de reg", "Agrupa les plantes segons l'aigua que necessiten per no regar de més."], ["Millora el sòl", "Un sòl amb matèria orgànica reté millor l'aigua."], ["Menys gespa", "Reserva la gespa per on s'utilitza i canvia la resta per entapissants o grava."], ["Plantes adaptades", "Espècies autòctones i mediterrànies que viuen amb el clima de les illes."], ["Reg eficient", "Degoteig, programador i reg a trenc d'alba o al vespre."], ["Encoixinat", "Escorça, grava o restes de poda triturades redueixen l'evaporació i les males herbes."], ["Manteniment just", "Poda i adoba només el necessari: una planta forçada demana més aigua."]],
  en: [["Design by water zones", "Group plants by how much water they need so you don't overwater."], ["Improve the soil", "Soil rich in organic matter holds water better."], ["Less lawn", "Keep grass where it's used and replace the rest with ground cover or gravel."], ["Adapted plants", "Native and Mediterranean species that thrive in the islands' climate."], ["Efficient watering", "Drip lines, a timer and watering at dawn or dusk."], ["Mulch", "Bark, gravel or shredded prunings cut evaporation and weeds."], ["Just enough care", "Prune and feed only what's needed: a forced plant asks for more water."]],
  de: [["Nach Wasserzonen planen", "Pflanzen nach Wasserbedarf gruppieren, um nicht zu viel zu gießen."], ["Boden verbessern", "Humusreicher Boden speichert Wasser besser."], ["Weniger Rasen", "Rasen nur dort, wo er genutzt wird; den Rest durch Bodendecker oder Kies ersetzen."], ["Angepasste Pflanzen", "Heimische und mediterrane Arten, die mit dem Inselklima zurechtkommen."], ["Effiziente Bewässerung", "Tropfbewässerung, Zeitschaltuhr und Gießen am frühen Morgen oder Abend."], ["Mulchen", "Rinde, Kies oder gehäckseltes Schnittgut reduzieren Verdunstung und Unkraut."], ["Pflege mit Maß", "Nur so viel schneiden und düngen wie nötig: Eine getriebene Pflanze braucht mehr Wasser."]],
};
export const PLANTA_MES = [
["Salvia rosmarinus", { es: "Florece en pleno invierno y da alimento a las abejas cuando casi nada florece.", ca: "Floreix en ple hivern i dona aliment a les abelles quan gairebé res no floreix.", en: "It blooms in midwinter and feeds the bees when almost nothing else flowers.", de: "Blüht mitten im Winter und versorgt Bienen, wenn sonst kaum etwas blüht." }],
["Prunus dulcis", { es: "Los campos de Mallorca se tiñen de blanco y rosa: es el mes de los almendros en flor.", ca: "Els camps de Mallorca es tenyeixen de blanc i rosa: és el mes dels ametllers en flor.", en: "Mallorca's fields turn white and pink: it's almond blossom month.", de: "Mallorcas Felder färben sich weiß und rosa: Es ist der Monat der Mandelblüte." }],
["Cistus albidus", { es: "Llega la primavera y la jara se cubre de flores rosas con muy poca agua.", ca: "Arriba la primavera i l'estepa es cobreix de flors roses amb molt poca aigua.", en: "Spring arrives and the rockrose covers itself in pink flowers on very little water.", de: "Der Frühling kommt und die Zistrose bedeckt sich mit rosa Blüten – bei sehr wenig Wasser." }],
["Trachelospermum jasminoides", { es: "Es el momento de plantarlo para disfrutar de su perfume en mayo.", ca: "És el moment de plantar-lo per gaudir del seu perfum al maig.", en: "Plant it now to enjoy its scent in May.", de: "Jetzt pflanzen, um im Mai seinen Duft zu genießen." }],
["Lavandula angustifolia / dentata", { es: "Empieza su floración: color, aroma y mariposas en tu jardín.", ca: "Comença la floració: color, aroma i papallones al teu jardí.", en: "Its flowering begins: colour, scent and butterflies in your garden.", de: "Die Blüte beginnt: Farbe, Duft und Schmetterlinge im Garten." }],
["Bougainvillea spectabilis", { es: "Con el calor explota de color. Pocas plantas dan tanto con tan poca agua.", ca: "Amb la calor esclata de color. Poques plantes donen tant amb tan poca aigua.", en: "The heat makes it burst with colour. Few plants give so much on so little water.", de: "Mit der Hitze explodiert sie vor Farbe. Wenige Pflanzen geben so viel mit so wenig Wasser." }],
["Hibiscus rosa-sinensis", { es: "Una flor nueva cada día durante todo el verano.", ca: "Una flor nova cada dia durant tot l'estiu.", en: "A new flower every day all summer long.", de: "Den ganzen Sommer jeden Tag eine neue Blüte." }],
["Plumbago auriculata", { es: "Su azul cielo refresca la vista en los días más calurosos.", ca: "El seu blau cel refresca la vista els dies més calorosos.", en: "Its sky blue cools the eye on the hottest days.", de: "Sein Himmelblau erfrischt das Auge an den heißesten Tagen." }],
["Punica granatum", { es: "Llega la cosecha de granadas: árbol bonito, resistente y con fruto.", ca: "Arriba la collita de magranes: arbre bonic, resistent i amb fruit.", en: "Pomegranate harvest time: a pretty, tough tree that gives fruit.", de: "Granatapfelernte: ein schöner, robuster Baum mit Früchten." }],
["Ceratonia siliqua", { es: "Con las primeras lluvias empieza la mejor época para plantar árboles. El algarrobo es el más mallorquín.", ca: "Amb les primeres pluges comença la millor època per plantar arbres. El garrover és el més mallorquí.", en: "The first rains open the best season for planting trees. The carob is the most Mallorcan of all.", de: "Mit dem ersten Regen beginnt die beste Pflanzzeit für Bäume. Der Johannisbrotbaum ist der mallorquinischste." }],
["Arbutus unedo", { es: "Ahora luce a la vez flores blancas y frutos rojos: puro otoño.", ca: "Ara llueix alhora flors blanques i fruits vermells: pura tardor.", en: "Right now it shows white flowers and red fruit at once: pure autumn.", de: "Jetzt trägt er gleichzeitig weiße Blüten und rote Früchte: Herbst pur." }],
["Euphorbia pulcherrima", { es: "La planta de la Navidad. Te enseñamos a que dure hasta la primavera.", ca: "La planta de Nadal. T'ensenyam a fer que duri fins a la primavera.", en: "The Christmas plant. We'll show you how to keep it going until spring.", de: "Die Weihnachtspflanze. Wir zeigen dir, wie sie bis zum Frühling hält." }],
];
export const PM_T = {
es: { et: "Planta del mes", btn: "Pregúntanos por ella", guia: "Ver todas las plantas →", msg: "Hola, me interesa la planta del mes: " },
ca: { et: "Planta del mes", btn: "Demana'ns per ella", guia: "Veure totes les plantes →", msg: "Hola, m'interessa la planta del mes: " },
en: { et: "Plant of the month", btn: "Ask us about it", guia: "See all plants →", msg: "Hello, I'm interested in the plant of the month: " },
de: { et: "Pflanze des Monats", btn: "Frag uns danach", guia: "Alle Pflanzen ansehen →", msg: "Hallo, ich interessiere mich für die Pflanze des Monats: " },
};
