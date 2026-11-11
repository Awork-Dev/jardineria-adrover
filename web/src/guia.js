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
  ["Prunus dulcis", "sol", "bajo", "no", false, {
    es: ["Almendro", "El árbol del paisaje mallorquín. Florece en pleno invierno, apenas necesita riego y da almendras en verano. Pódalo después de la cosecha."],
    ca: ["Ametller", "L'arbre del paisatge mallorquí. Floreix en ple hivern, gairebé no necessita reg i fa ametlles a l'estiu. Poda'l després de la collita."],
    en: ["Almond tree", "The tree of the Mallorcan landscape. It blooms in midwinter, needs hardly any water and gives almonds in summer. Prune it after the harvest."],
    de: ["Mandelbaum", "Der Baum der mallorquinischen Landschaft. Blüht mitten im Winter, braucht kaum Wasser und trägt im Sommer Mandeln. Nach der Ernte schneiden."] }],
  ["Punica granatum", "sol", "bajo", "?", false, {
    es: ["Granado", "Árbol pequeño muy resistente al calor y la sequía. Flores rojas en primavera y granadas en otoño. Admite poda para mantenerlo bajo."],
    ca: ["Magraner", "Arbre petit molt resistent a la calor i la sequera. Flors vermelles a la primavera i magranes a la tardor. Admet poda per mantenir-lo baix."],
    en: ["Pomegranate", "A small tree that stands up well to heat and drought. Red flowers in spring and pomegranates in autumn. It can be pruned to keep it low."],
    de: ["Granatapfel", "Kleiner Baum, sehr hitze- und trockenheitsfest. Rote Blüten im Frühling, Granatäpfel im Herbst. Lässt sich niedrig halten."] }],
  ["Arbutus unedo", "sol semi", "bajo", "?", true, {
    es: ["Madroño", "Arbolito autóctono de hoja perenne. En otoño luce a la vez flores blancas y frutos rojos comestibles. Una vez arraigado aguanta bien la sequía y el viento."],
    ca: ["Arboç", "Arbret autòcton de fulla perenne. A la tardor llueix alhora flors blanques i fruits vermells comestibles. Un cop arrelat aguanta bé la sequera i el vent."],
    en: ["Strawberry tree", "A native evergreen small tree. In autumn it shows white flowers and edible red fruit at the same time. Once established it copes well with drought and wind."],
    de: ["Erdbeerbaum", "Heimischer immergrüner kleiner Baum. Im Herbst trägt er gleichzeitig weiße Blüten und essbare rote Früchte. Eingewachsen verträgt er Trockenheit und Wind gut."] }],
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
    ["Olea europaea", "sol", "bajo", "si", false, {
    es: ["Olivo", "El árbol de Mallorca por excelencia. Vive siglos con muy poca agua y una poda de aclareo a final de invierno lo mantiene sano."],
    ca: ["Olivera", "L'arbre de Mallorca per excel·lència. Viu segles amb molt poca aigua i una poda d'aclarida a final d'hivern el manté sa."],
    en: ["Olive tree", "Majorca's tree par excellence. Lives for centuries on very little water; thinning it out in late winter keeps it healthy."],
    de: ["Olivenbaum", "Der Baum Mallorcas schlechthin. Wird mit sehr wenig Wasser jahrhundertealt; ein Auslichtungsschnitt im Spätwinter hält ihn gesund."] }],
    ["Ficus carica", "sol", "bajo", "no", false, {
    es: ["Higuera", "Aguanta la sequía y los suelos pobres y da higos a final de verano. Su savia irrita la piel: usa guantes al podarla."],
    ca: ["Figuera", "Aguanta la sequera i els sòls pobres i fa figues a final d'estiu. La saba irrita la pell: posa't guants per podar-la."],
    en: ["Fig tree", "Copes with drought and poor soil and fruits in late summer. Its sap irritates the skin, so wear gloves when pruning."],
    de: ["Feigenbaum", "Verträgt Trockenheit und karge Böden und trägt im Spätsommer Feigen. Der Milchsaft reizt die Haut: beim Schneiden Handschuhe tragen."] }],
    ["Jasminum officinale", "sol semi", "medio", "si", false, {
    es: ["Jazmín", "Flores blancas muy perfumadas en verano. Necesita un apoyo para trepar y una poda ligera al acabar la floración."],
    ca: ["Gessamí", "Flors blanques molt perfumades a l'estiu. Necessita un suport per enfilar-se i una poda lleugera en acabar la floració."],
    en: ["Common jasmine", "Highly scented white flowers in summer. Needs support to climb and a light trim once flowering is over."],
    de: ["Echter Jasmin", "Stark duftende weiße Blüten im Sommer. Braucht eine Rankhilfe und einen leichten Schnitt nach der Blüte."] }],
    ["Wisteria sinensis", "sol", "medio", "no", false, {
    es: ["Glicinia", "Racimos lilas y perfumados en primavera. Crece mucho: necesita una pérgola fuerte y dos podas al año, en verano y en invierno."],
    ca: ["Glicina", "Raïms lila i perfumats a la primavera. Creix molt: necessita una pèrgola forta i dues podes l'any, a l'estiu i a l'hivern."],
    en: ["Chinese wisteria", "Fragrant lilac clusters in spring. A vigorous grower: it needs a sturdy pergola and pruning twice a year, in summer and winter."],
    de: ["Chinesischer Blauregen", "Duftende lila Trauben im Frühling. Wächst stark: braucht eine stabile Pergola und zwei Schnitte im Jahr, im Sommer und im Winter."] }],
    ["Pittosporum tobira", "sol semi", "bajo", "?", false, {
    es: ["Pitósporo", "Seto muy resistente al viento y al salitre. En primavera da flores blancas con olor a azahar."],
    ca: ["Pitòspor", "Tanca molt resistent al vent i a la salinitat. A la primavera fa flors blanques amb olor de tarongina."],
    en: ["Japanese mock orange", "A hedge that stands up well to wind and salt spray. White, orange-blossom-scented flowers in spring."],
    de: ["Chinesischer Klebsame", "Sehr wind- und salzfeste Hecke. Im Frühling weiße Blüten, die nach Orangenblüten duften."] }],
    ["Westringia fruticosa", "sol", "bajo", "?", false, {
    es: ["Romero australiano", "Parecido al romero pero más compacto. Aguanta la primera línea de mar y se recorta muy bien para setos bajos."],
    ca: ["Romaní australià", "Semblant al romaní però més compacte. Aguanta la primera línia de mar i es retalla molt bé per fer tanques baixes."],
    en: ["Coastal rosemary", "Like rosemary but more compact. Copes with seafront sites and clips well into low hedges."],
    de: ["Australischer Rosmarin", "Ähnlich wie Rosmarin, aber kompakter. Verträgt die erste Meereslinie und lässt sich gut zu niedrigen Hecken schneiden."] }],
    ["Teucrium fruticans", "sol", "bajo", "?", false, {
    es: ["Olivilla", "Hojas plateadas y flores azul claro casi todo el año. Muy resistente a la sequía, ideal para setos de aire mediterráneo."],
    ca: ["Olivereta", "Fulles platejades i flors blau clar gairebé tot l'any. Molt resistent a la sequera, ideal per a tanques d'aire mediterrani."],
    en: ["Shrubby germander", "Silvery leaves and pale blue flowers for much of the year. Very drought tolerant, ideal for Mediterranean-style hedges."],
    de: ["Strauch-Gamander", "Silbrige Blätter und hellblaue Blüten fast das ganze Jahr. Sehr trockenheitsfest, ideal für mediterrane Hecken."] }],
    ["Viburnum tinus", "sol semi sombra", "medio", "?", true, {
    es: ["Durillo", "Arbusto autóctono que florece en pleno invierno. Aguanta la semisombra y sirve para setos libres."],
    ca: ["Marfull", "Arbust autòcton que floreix en ple hivern. Aguanta la mitja ombra i serveix per a tanques lliures."],
    en: ["Laurustinus", "A native shrub that flowers in the depths of winter. Tolerates part shade and suits informal hedges."],
    de: ["Mittelmeer-Schneeball", "Heimischer Strauch, der mitten im Winter blüht. Verträgt Halbschatten und eignet sich für frei wachsende Hecken."] }],
    ["Polygala myrtifolia", "sol", "bajo", "?", false, {
    es: ["Polígala", "Flores violetas casi todo el año y mucha resistencia al calor. Vigila la Xylella: si se secan ramas sin motivo, consúltanos."],
    ca: ["Polígala", "Flors violetes gairebé tot l'any i molta resistència a la calor. Vigila la Xylella: si s'assequen branques sense motiu, consulta'ns."],
    en: ["Sweet pea shrub", "Violet flowers almost all year and very heat tolerant. Watch out for Xylella: if branches dry out for no reason, ask us."],
    de: ["Myrtenblättrige Kreuzblume", "Violette Blüten fast das ganze Jahr, sehr hitzefest. Auf Xylella achten: wenn Zweige grundlos vertrocknen, fragen Sie uns."] }],
    ["Callistemon citrinus", "sol", "medio", "si", false, {
    es: ["Limpiatubos", "Sus flores rojas en forma de cepillo atraen a abejas y pájaros. Aguanta bien el viento y el suelo calizo."],
    ca: ["Escurapipes", "Les seves flors vermelles en forma de raspall atreuen abelles i ocells. Aguanta bé el vent i el sòl calcari."],
    en: ["Bottlebrush", "Its red brush-shaped flowers draw bees and birds. Handles wind and limy soil well."],
    de: ["Zylinderputzer", "Die roten, bürstenförmigen Blüten locken Bienen und Vögel an. Verträgt Wind und kalkhaltigen Boden gut."] }],
    ["Santolina chamaecyparissus", "sol", "bajo", "?", false, {
    es: ["Santolina", "Mata gris y aromática con botones amarillos en verano. Pide sol, suelo suelto y casi nada de agua."],
    ca: ["Espernallac", "Mata grisa i aromàtica amb botons grocs a l'estiu. Vol sol, sòl solt i gairebé gens d'aigua."],
    en: ["Cotton lavender", "A grey, aromatic mound with yellow button flowers in summer. Wants sun, loose soil and hardly any water."],
    de: ["Heiligenkraut", "Grauer, duftender Busch mit gelben Blütenköpfchen im Sommer. Braucht Sonne, lockeren Boden und kaum Wasser."] }],
    ["Salvia officinalis", "sol", "bajo", "si", false, {
    es: ["Salvia", "Aromática de cocina con flores lilas que encantan a las abejas. Una poda tras la floración evita que se vuelva leñosa."],
    ca: ["Sàlvia", "Aromàtica de cuina amb flors lila que encanten a les abelles. Una poda després de la floració evita que es torni llenyosa."],
    en: ["Common sage", "A kitchen herb with lilac flowers that bees love. Pruning after flowering stops it getting woody."],
    de: ["Echter Salbei", "Küchenkraut mit lila Blüten, die Bienen lieben. Ein Schnitt nach der Blüte verhindert, dass er verholzt."] }],
    ["Agapanthus africanus", "sol semi", "medio", "no", false, {
    es: ["Agapanto", "Bolas de flores azules o blancas en verano. Florece mejor si está algo apretado en la maceta."],
    ca: ["Agapant", "Boles de flors blaves o blanques a l'estiu. Floreix millor si està una mica atapeït al test."],
    en: ["African lily", "Balls of blue or white flowers in summer. Flowers best when slightly pot-bound."],
    de: ["Schmucklilie", "Kugeln aus blauen oder weißen Blüten im Sommer. Blüht besser, wenn der Topf etwas eng ist."] }],
    ["Phoenix canariensis", "sol", "bajo", "?", false, {
    es: ["Palmera canaria", "Palmera de gran porte, muy vulnerable al picudo rojo: pódala solo en invierno y hazle tratamientos preventivos."],
    ca: ["Palmera canària", "Palmera de gran port, molt vulnerable al morrut: poda-la només a l'hivern i fes-li tractaments preventius."],
    en: ["Canary Island date palm", "A large palm that is very vulnerable to the red palm weevil: prune it only in winter and treat it preventively."],
    de: ["Kanarische Dattelpalme", "Große Palme, sehr anfällig für den Palmrüssler: nur im Winter schneiden und vorbeugend behandeln."] }],
    ["Cycas revoluta", "sol semi", "bajo", "no", false, {
    es: ["Cica", "Parece una palmera pero es mucho más antigua. Crece muy despacio y es muy tóxica para perros y gatos."],
    ca: ["Cica", "Sembla una palmera però és molt més antiga. Creix molt a poc a poc i és molt tòxica per a cans i moixos."],
    en: ["Sago palm", "Looks like a palm but is far more ancient. Grows very slowly and is highly toxic to dogs and cats."],
    de: ["Japanischer Palmfarn", "Sieht aus wie eine Palme, ist aber viel älter. Wächst sehr langsam und ist für Hunde und Katzen sehr giftig."] }],
    ["Howea forsteriana", "semi sombra", "medio", "si", false, {
    es: ["Kentia", "La palmera de interior más agradecida: aguanta poca luz y ambientes secos. Riega cuando la tierra esté seca por arriba."],
    ca: ["Kèntia", "La palmera d'interior més agraïda: aguanta poca llum i ambients secs. Rega quan la terra estigui seca per damunt."],
    en: ["Kentia palm", "The most forgiving indoor palm: copes with low light and dry air. Water when the top of the soil is dry."],
    de: ["Kentiapalme", "Die dankbarste Zimmerpalme: verträgt wenig Licht und trockene Luft. Gießen, wenn die Erde oben trocken ist."] }],
    ["Crassula ovata", "sol semi", "bajo", "no", false, {
    es: ["Árbol de jade", "Suculenta de hojas carnosas que vive décadas en maceta. Deja secar la tierra entre riegos: el exceso de agua la pudre."],
    ca: ["Arbre de jade", "Suculenta de fulles carnoses que viu dècades en test. Deixa assecar la terra entre regs: l'excés d'aigua la podreix."],
    en: ["Jade plant", "A fleshy-leaved succulent that lives for decades in a pot. Let the soil dry between waterings: too much water rots it."],
    de: ["Geldbaum", "Sukkulente mit fleischigen Blättern, die im Topf Jahrzehnte lebt. Erde zwischen dem Gießen trocknen lassen: zu viel Wasser lässt sie faulen."] }],
    ["Juniperus phoenicea", "sol", "bajo", "?", true, {
    es: ["Sabina", "Conífera autóctona de dunas y acantilados. Crece despacio, aguanta el salitre y casi no necesita agua."],
    ca: ["Savina", "Conífera autòctona de dunes i penya-segats. Creix a poc a poc, aguanta la salinitat i gairebé no necessita aigua."],
    en: ["Phoenician juniper", "A native conifer of dunes and cliffs. Slow-growing, salt-tolerant and needs almost no water."],
    de: ["Phönizischer Wacholder", "Heimischer Nadelbaum der Dünen und Klippen. Wächst langsam, verträgt Salz und braucht kaum Wasser."] }],
    ["Citrus × sinensis", "sol", "medio", "no", false, {
    es: ["Naranjo", "Azahar perfumado en primavera y naranjas en invierno. Necesita riego regular en verano y abono para cítricos de febrero a septiembre."],
    ca: ["Taronger", "Tarongina perfumada a la primavera i taronges a l'hivern. Necessita reg regular a l'estiu i adob per a cítrics de febrer a setembre."],
    en: ["Orange tree", "Scented blossom in spring and oranges in winter. Needs regular watering in summer and citrus feed from February to September."],
    de: ["Orangenbaum", "Duftende Blüten im Frühling und Orangen im Winter. Braucht im Sommer regelmäßig Wasser und von Februar bis September Zitrusdünger."] }],
    ["Laurus nobilis", "sol semi", "bajo", "no", false, {
    es: ["Laurel", "Hojas para la cocina todo el año. Se recorta muy bien como seto o en maceta y aguanta la sequía cuando está arraigado."],
    ca: ["Llorer", "Fulles per a la cuina tot l'any. Es retalla molt bé com a tanca o en test i aguanta la sequera quan està arrelat."],
    en: ["Bay laurel", "Leaves for the kitchen all year round. Clips well as a hedge or in a pot and tolerates drought once established."],
    de: ["Echter Lorbeer", "Das ganze Jahr Blätter für die Küche. Lässt sich gut als Hecke oder im Topf schneiden und verträgt eingewurzelt Trockenheit."] }],
    ["Cupressus sempervirens", "sol", "bajo", "?", false, {
    es: ["Ciprés", "Columna verde que no necesita poda y apenas agua. Planta los setos con espacio y evita el encharcamiento, que le provoca hongos."],
    ca: ["Xiprer", "Columna verda que no necessita poda i gairebé gens d'aigua. Planta les tanques amb espai i evita l'entollament, que li provoca fongs."],
    en: ["Mediterranean cypress", "A green column that needs no pruning and hardly any water. Space hedge plants well and avoid waterlogging, which brings fungal disease."],
    de: ["Mittelmeer-Zypresse", "Grüne Säule, die keinen Schnitt und kaum Wasser braucht. Hecken mit Abstand pflanzen und Staunässe vermeiden, sie fördert Pilze."] }],
    ["Rhamnus alaternus", "sol semi", "bajo", "?", true, {
    es: ["Aladierno", "Arbusto autóctono de hoja perenne y brillante. Crece rápido, aguanta la sequía y el viento y da bayas que gustan a los pájaros."],
    ca: ["Llampúdol", "Arbust autòcton de fulla perenne i lluent. Creix aviat, aguanta la sequera i el vent i fa baies que agraden als ocells."],
    en: ["Mediterranean buckthorn", "A native evergreen shrub with glossy leaves. Fast-growing, drought and wind tolerant, with berries that birds love."],
    de: ["Immergrüner Kreuzdorn", "Heimischer immergrüner Strauch mit glänzenden Blättern. Wächst schnell, verträgt Trockenheit und Wind; die Beeren mögen Vögel."] }],
    ["Vitis vinifera", "sol", "bajo", "no", false, {
    es: ["Parra", "La sombra clásica de las pérgolas mallorquinas, con uva a final de verano. Se poda en invierno, cuando no tiene hojas."],
    ca: ["Parra", "L'ombra clàssica de les pèrgoles mallorquines, amb raïm a final d'estiu. Es poda a l'hivern, quan no té fulles."],
    en: ["Grapevine", "The classic shade for Majorcan pergolas, with grapes in late summer. Prune in winter, when it is leafless."],
    de: ["Weinrebe", "Der klassische Schatten mallorquinischer Pergolen, mit Trauben im Spätsommer. Schnitt im Winter, wenn sie kein Laub trägt."] }],
    ["Jacaranda mimosifolia", "sol", "medio", "?", false, {
    es: ["Jacaranda", "Se cubre de flores lilas a final de primavera. Necesita un sitio resguardado del viento y riego los primeros veranos."],
    ca: ["Xicranda", "Es cobreix de flors lila a final de primavera. Necessita un lloc arrecerat del vent i reg els primers estius."],
    en: ["Jacaranda", "Smothered in lilac flowers in late spring. Needs a spot sheltered from wind and watering during its first summers."],
    de: ["Jacaranda", "Im Spätfrühling voller lila Blüten. Braucht einen windgeschützten Platz und in den ersten Sommern Wasser."] }],
    ["Lagerstroemia indica", "sol", "medio", "si", false, {
    es: ["Árbol de Júpiter", "Florece en pleno verano, cuando casi nada lo hace. Árbol pequeño, ideal para jardines y patios; se poda a final de invierno."],
    ca: ["Arbre de Júpiter", "Floreix en ple estiu, quan gairebé res ho fa. Arbre petit, ideal per a jardins i patis; es poda a final d'hivern."],
    en: ["Crape myrtle", "Flowers in high summer, when little else does. A small tree, ideal for gardens and patios; prune in late winter."],
    de: ["Kreppmyrte", "Blüht im Hochsommer, wenn sonst kaum etwas blüht. Kleiner Baum, ideal für Gärten und Innenhöfe; Schnitt im Spätwinter."] }],
    ["Hedera helix", "semi sombra", "medio", "no", true, {
    es: ["Hiedra", "Cubre muros y suelos en sombra, donde casi nada crece. Recórtala una o dos veces al año para que no invada. Tóxica para mascotas."],
    ca: ["Heura", "Cobreix murs i sòls a l'ombra, on gairebé res creix. Retalla-la una o dues vegades l'any perquè no envaeixi. Tòxica per a mascotes."],
    en: ["Common ivy", "Covers walls and ground in shade, where little else grows. Trim once or twice a year to keep it in check. Toxic to pets."],
    de: ["Efeu", "Bedeckt Mauern und Boden im Schatten, wo sonst kaum etwas wächst. Ein- bis zweimal im Jahr schneiden, damit er nicht wuchert. Giftig für Haustiere."] }],
    ["Lonicera implexa", "sol semi", "bajo", "?", true, {
    es: ["Madreselva mediterránea", "La madreselva autóctona de Mallorca: flores perfumadas en primavera y poca agua. Ideal para cubrir vallas."],
    ca: ["Xuclamel (rotaboc)", "El xuclamel autòcton de Mallorca: flors perfumades a la primavera i poca aigua. Ideal per cobrir tanques."],
    en: ["Mediterranean honeysuckle", "Majorca's native honeysuckle: scented flowers in spring and little water needed. Ideal for covering fences."],
    de: ["Macchien-Geißblatt", "Das heimische Geißblatt Mallorcas: duftende Blüten im Frühling bei wenig Wasser. Ideal zum Begrünen von Zäunen."] }],
    ["Osteospermum ecklonis", "sol", "medio", "?", false, {
    es: ["Margarita africana", "Alfombra de margaritas en primavera y otoño. Quita las flores secas y recórtala en verano para que vuelva a florecer."],
    ca: ["Margarida africana", "Catifa de margarides a la primavera i a la tardor. Lleva les flors seques i retalla-la a l'estiu perquè torni a florir."],
    en: ["African daisy", "A carpet of daisies in spring and autumn. Deadhead it and trim in summer for a second flush."],
    de: ["Kapmargerite", "Ein Margeritenteppich im Frühling und Herbst. Verblühtes entfernen und im Sommer zurückschneiden, dann blüht sie erneut."] }],
    ["Aeonium arboreum", "sol semi", "bajo", "?", false, {
    es: ["Eonio", "Rosetas de hojas carnosas sobre tallos desnudos. Crece en invierno y descansa en verano: riégalo poco cuando hace calor."],
    ca: ["Eoni", "Rosetes de fulles carnoses sobre tiges nues. Creix a l'hivern i descansa a l'estiu: rega'l poc quan fa calor."],
    en: ["Tree aeonium", "Rosettes of fleshy leaves on bare stems. It grows in winter and rests in summer: water sparingly in the heat."],
    de: ["Baum-Aeonium", "Rosetten aus fleischigen Blättern auf kahlen Trieben. Wächst im Winter und ruht im Sommer: bei Hitze nur wenig gießen."] }],
    ["Abelia × grandiflora", "sol semi", "medio", "?", false, {
    es: ["Abelia", "Florece de junio a octubre con campanillas blancas que atraen mariposas. Sirve para setos libres y pide poca poda."],
    ca: ["Abèlia", "Floreix de juny a octubre amb campanetes blanques que atreuen papallones. Serveix per a tanques lliures i demana poca poda."],
    en: ["Glossy abelia", "Flowers from June to October with white bells that attract butterflies. Good for informal hedges and needs little pruning."],
    de: ["Großblütige Abelie", "Blüht von Juni bis Oktober mit weißen Glöckchen, die Schmetterlinge anlocken. Für frei wachsende Hecken, braucht wenig Schnitt."] }],
    ["Photinia × fraseri", "sol semi", "medio", "?", false, {
    es: ["Fotinia", "Seto de brotes rojos muy vistosos. Cada recorte saca hojas nuevas rojas; riégala en verano hasta que arraigue."],
    ca: ["Fotínia", "Tanca de brots vermells molt vistosos. Cada retall treu fulles noves vermelles; rega-la a l'estiu fins que arreli."],
    en: ["Red robin photinia", "A hedge with striking red shoots. Every trim brings a new flush of red leaves; water in summer until established."],
    de: ["Glanzmispel", "Hecke mit auffälligen roten Trieben. Jeder Schnitt bringt neue rote Blätter; im Sommer gießen, bis sie eingewurzelt ist."] }],
    ["Dypsis lutescens", "semi sombra", "medio", "si", false, {
    es: ["Areca", "Palmera de interior de hojas finas y arqueadas. Quiere mucha luz sin sol directo y la tierra siempre algo húmeda."],
    ca: ["Areca", "Palmera d'interior de fulles fines i arquejades. Vol molta llum sense sol directe i la terra sempre un poc humida."],
    en: ["Areca palm", "An indoor palm with fine, arching fronds. Wants bright light without direct sun and soil kept slightly moist."],
    de: ["Goldfruchtpalme", "Zimmerpalme mit feinen, überhängenden Wedeln. Braucht viel Licht ohne direkte Sonne und stets leicht feuchte Erde."] }],
    ["Phalaenopsis spp.", "semi sombra", "medio", "si", false, {
    es: ["Orquídea mariposa", "La orquídea más fácil. Riégala por inmersión una vez a la semana y deja que escurra bien; luz clara sin sol directo."],
    ca: ["Orquídia papallona", "L'orquídia més fàcil. Rega-la per immersió una vegada per setmana i deixa que escorri bé; llum clara sense sol directe."],
    en: ["Moth orchid", "The easiest orchid. Water by soaking once a week and let it drain well; bright light, no direct sun."],
    de: ["Schmetterlingsorchidee", "Die einfachste Orchidee. Einmal pro Woche tauchen und gut abtropfen lassen; helles Licht ohne direkte Sonne."] }],
    ["Ficus elastica", "semi sombra", "medio", "no", false, {
    es: ["Ficus de goma", "Hojas grandes y brillantes para interiores luminosos. Limpia el polvo de las hojas y riega cuando la tierra se seque por arriba."],
    ca: ["Ficus de goma", "Fulles grans i lluents per a interiors lluminosos. Lleva la pols de les fulles i rega quan la terra s'assequi per damunt."],
    en: ["Rubber plant", "Large glossy leaves for bright rooms. Wipe dust off the leaves and water when the top of the soil dries out."],
    de: ["Gummibaum", "Große, glänzende Blätter für helle Räume. Staub von den Blättern wischen und gießen, wenn die Erde oben trocken ist."] }],
    ["Tulbaghia violacea", "sol", "bajo", "?", false, {
    es: ["Tulbalgia", "Matas de flores lilas de primavera a otoño que casi no piden agua. Muy usada en borduras; las hojas huelen a ajo al tocarlas."],
    ca: ["Tulbàgia", "Mates de flors lila de primavera a tardor que gairebé no demanen aigua. Molt usada en vorades; les fulles fan olor d'all en tocar-les."],
    en: ["Society garlic", "Clumps of lilac flowers from spring to autumn on very little water. Widely used for edging; the leaves smell of garlic when touched."],
    de: ["Zimmerknoblauch (Tulbaghie)", "Horste mit lila Blüten von Frühling bis Herbst bei sehr wenig Wasser. Beliebt als Einfassung; die Blätter riechen bei Berührung nach Knoblauch."] }],
    ["Citrus reticulata", "sol", "medio", "no", false, {
    es: ["Mandarino", "El cítrico más agradecido en maceta. Mandarinas de otoño a invierno; necesita sol, riego regular en verano y abono para cítricos."],
    ca: ["Mandariner", "El cítric més agraït en test. Mandarines de tardor a hivern; necessita sol, reg regular a l'estiu i adob per a cítrics."],
    en: ["Mandarin tree", "The most rewarding citrus for a pot. Mandarins from autumn to winter; needs sun, regular summer watering and citrus feed."],
    de: ["Mandarinenbaum", "Die dankbarste Zitruspflanze für den Topf. Mandarinen von Herbst bis Winter; braucht Sonne, im Sommer regelmäßig Wasser und Zitrusdünger."] }],
    ["Eriobotrya japonica", "sol", "medio", "?", false, {
    es: ["Níspero", "Florece en otoño y da fruta en primavera, cuando casi ningún otro frutal la tiene. Hoja perenne y buena sombra; se poda tras la cosecha."],
    ca: ["Nesprer", "Floreix a la tardor i fa fruita a la primavera, quan gairebé cap altre fruiter en té. Fulla perenne i bona ombra; es poda després de la collita."],
    en: ["Loquat", "Flowers in autumn and fruits in spring, when almost no other fruit tree does. Evergreen with good shade; prune after harvest."],
    de: ["Wollmispel (Níspero)", "Blüht im Herbst und trägt im Frühling Früchte, wenn kaum ein anderer Obstbaum es tut. Immergrün und guter Schattenspender; Schnitt nach der Ernte."] }],
    ["Quercus ilex", "sol semi", "bajo", "?", true, {
    es: ["Encina", "El árbol de los bosques de la Serra. Crece despacio, vive siglos y, una vez arraigada, no necesita riego. Plántala joven y en otoño."],
    ca: ["Alzina", "L'arbre dels boscos de la Serra. Creix a poc a poc, viu segles i, una vegada arrelada, no necessita reg. Planta-la jove i a la tardor."],
    en: ["Holm oak", "The tree of the Serra de Tramuntana woods. Slow-growing, lives for centuries and needs no watering once established. Plant it young, in autumn."],
    de: ["Steineiche", "Der Baum der Wälder der Serra de Tramuntana. Wächst langsam, wird jahrhundertealt und braucht eingewurzelt kein Gießen. Jung und im Herbst pflanzen."] }],
    ["Celtis australis", "sol", "bajo", "?", false, {
    es: ["Almez", "El «lledoner» de las plazas y posesiones mallorquinas: sombra amplia en verano y hoja caduca en invierno. Resistente a la sequía y de raíz profunda."],
    ca: ["Lledoner", "El lledoner de les places i possessions mallorquines: ombra ampla a l'estiu i fulla caduca a l'hivern. Resistent a la sequera i d'arrel fonda."],
    en: ["Nettle tree", "The classic shade tree of Majorcan squares and estates: broad shade in summer, bare in winter. Drought-resistant and deep-rooted."],
    de: ["Zürgelbaum", "Der klassische Schattenbaum mallorquinischer Plätze und Landgüter: breiter Schatten im Sommer, laubfrei im Winter. Trockenheitsfest und tief wurzelnd."] }],
    ["Prunus armeniaca", "sol", "bajo", "?", false, {
    es: ["Albaricoquero", "Frutal tradicional del Pla de Mallorca. Flor temprana en febrero y fruta en junio. Pódalo en verano, tras la cosecha, para evitar la gomosis."],
    ca: ["Albercoquer", "Fruiter tradicional del Pla de Mallorca. Flor primerenca al febrer i fruita al juny. Poda'l a l'estiu, després de la collita, per evitar la gomosi."],
    en: ["Apricot tree", "A traditional fruit tree of Mallorca's central plain. Early blossom in February and fruit in June. Prune in summer, after harvest, to avoid gummosis."],
    de: ["Aprikosenbaum", "Traditioneller Obstbaum der Inselmitte. Frühe Blüte im Februar, Früchte im Juni. Im Sommer nach der Ernte schneiden, um Gummifluss zu vermeiden."] }],
    ["Morus alba", "sol", "bajo", "?", false, {
    es: ["Morera", "Sombra densa y rápida para terrazas y aparcamientos. Elige variedades sin fruto para no manchar el suelo; admite poda fuerte en invierno."],
    ca: ["Morera", "Ombra densa i ràpida per a terrasses i aparcaments. Tria varietats sense fruit per no embrutar el trespol; admet poda forta a l'hivern."],
    en: ["White mulberry", "Fast, dense shade for terraces and parking areas. Choose fruitless varieties to avoid stains; takes hard pruning in winter."],
    de: ["Weißer Maulbeerbaum", "Schneller, dichter Schatten für Terrassen und Parkplätze. Fruchtlose Sorten wählen, damit der Boden sauber bleibt; verträgt starken Winterschnitt."] }],
    ["Washingtonia robusta", "sol", "bajo", "?", false, {
    es: ["Washingtonia", "La palmera alta y esbelta de los paseos. Crece deprisa y aguanta viento y salitre. Menos atacada por el picudo que la canaria, pero conviene vigilarla."],
    ca: ["Washingtònia", "La palmera alta i esvelta dels passeigs. Creix aviat i aguanta vent i salinitat. Menys atacada pel morrut que la canària, però convé vigilar-la."],
    en: ["Mexican fan palm", "The tall, slender palm of promenades. Fast-growing and tolerant of wind and salt. Less attacked by the weevil than the Canary palm, but worth watching."],
    de: ["Mexikanische Washingtonpalme", "Die hohe, schlanke Palme der Promenaden. Wächst schnell und verträgt Wind und Salz. Weniger vom Palmrüssler befallen als die Kanarische, aber beobachten."] }],
    ["Phoenix dactylifera", "sol", "bajo", "?", false, {
    es: ["Palmera datilera", "Más esbelta y de hoja más gris que la canaria; suele echar hijuelos en la base. También sufre el picudo rojo: poda solo en invierno y trátala."],
    ca: ["Palmera datilera", "Més esvelta i de fulla més grisa que la canària; sol treure fillols a la base. També pateix el morrut roig: poda només a l'hivern i tracta-la."],
    en: ["Date palm", "Slimmer and greyer-leaved than the Canary palm; it often suckers at the base. It also suffers from red palm weevil: prune only in winter and treat it."],
    de: ["Echte Dattelpalme", "Schlanker und graulaubiger als die Kanarische; bildet oft Ausläufer am Fuß. Auch sie leidet unter dem Palmrüssler: nur im Winter schneiden und behandeln."] }],
    ["Dodonaea viscosa", "sol", "bajo", "?", false, {
    es: ["Dodonea", "Seto rápido de hoja fina, verde o púrpura. Aguanta viento, salitre y sequía, y se recorta bien. Ideal para cerrar una parcela en poco tiempo."],
    ca: ["Dodonea", "Tanca ràpida de fulla fina, verda o porpra. Aguanta vent, salinitat i sequera, i es retalla bé. Ideal per tancar una parcel·la en poc temps."],
    en: ["Hop bush", "A fast hedge with fine green or purple foliage. Takes wind, salt and drought, and clips well. Ideal for screening a plot quickly."],
    de: ["Dodonaea (Hopfenbusch)", "Schnelle Hecke mit feinem grünem oder purpurnem Laub. Verträgt Wind, Salz und Trockenheit und lässt sich gut schneiden. Ideal als rascher Sichtschutz."] }],
    ["Cestrum nocturnum", "sol semi", "medio", "no", false, {
    es: ["Galán de noche", "La «dama de nit» de los patios mallorquines: en las noches de verano perfuma todo el jardín. Riego regular y poda a final de invierno. Tóxico si se ingiere."],
    ca: ["Dama de nit", "La dama de nit dels patis mallorquins: les nits d'estiu perfuma tot el jardí. Reg regular i poda a final d'hivern. Tòxica si s'ingereix."],
    en: ["Night-blooming jasmine", "The classic of Majorcan patios: on summer nights it scents the whole garden. Regular watering and a prune in late winter. Toxic if eaten."],
    de: ["Nachtjasmin", "Der Klassiker mallorquinischer Innenhöfe: In Sommernächten beduftet er den ganzen Garten. Regelmäßig gießen, Schnitt im Spätwinter. Giftig bei Verzehr."] }],
    ["Hydrangea macrophylla", "semi sombra", "alto", "no", false, {
    es: ["Hortensia", "Para patios y terrazas a la sombra, lejos del sol de la tarde. Pide riego frecuente en verano y agua poco calcárea para mantener el color."],
    ca: ["Hortènsia", "Per a patis i terrasses a l'ombra, lluny del sol de l'horabaixa. Demana reg freqüent a l'estiu i aigua poc calcària per mantenir el color."],
    en: ["Hydrangea", "For shaded patios and terraces, away from afternoon sun. Needs frequent watering in summer and low-lime water to keep its colour."],
    de: ["Hortensie", "Für schattige Innenhöfe und Terrassen, ohne Nachmittagssonne. Braucht im Sommer häufig Wasser und kalkarmes Wasser, damit die Farbe hält."] }],
    ["Erica multiflora", "sol semi", "bajo", "?", true, {
    es: ["Brezo", "El «xiprell» de las garrigas: se cubre de flores rosas en otoño, cuando poco más florece, y alimenta a las abejas. No necesita riego ni abono."],
    ca: ["Xiprell", "El xiprell de les garrigues: es cobreix de flors roses a la tardor, quan poca cosa més floreix, i alimenta les abelles. No necessita reg ni adob."],
    en: ["Mediterranean heath", "A native of Mallorca's scrubland: smothered in pink flowers in autumn, when little else blooms, feeding the bees. Needs no watering or feeding."],
    de: ["Vielblütige Heide", "Heimisch in der Garrigue Mallorcas: im Herbst voller rosa Blüten, wenn sonst wenig blüht – eine Bienenweide. Braucht weder Gießen noch Dünger."] }],
    ["Hypericum balearicum", "sol semi", "bajo", "?", true, {
    es: ["Estepa joana", "Solo crece de forma natural en Baleares. Arbusto compacto de hojas onduladas y aromáticas, con flores amarillas de primavera a verano. Muy resistente a la sequía."],
    ca: ["Estepa joana", "Només creix de manera natural a les Balears. Arbust compacte de fulles ondulades i aromàtiques, amb flors grogues de primavera a estiu. Molt resistent a la sequera."],
    en: ["Balearic St John's wort", "Grows wild only in the Balearic Islands. A compact shrub with wavy, aromatic leaves and yellow flowers from spring to summer. Very drought-resistant."],
    de: ["Balearen-Johanniskraut", "Wächst wild nur auf den Balearen. Kompakter Strauch mit gewellten, duftenden Blättern und gelben Blüten von Frühling bis Sommer. Sehr trockenheitsfest."] }],
    ["Capparis spinosa", "sol", "bajo", "?", true, {
    es: ["Alcaparra", "La «tapera» de los márgenes mallorquines. Vive en muros y suelos pobres a pleno sol, casi sin agua. Los capullos son las alcaparras; se poda a ras en invierno."],
    ca: ["Taperera", "La taperera dels marges mallorquins. Viu en parets i sòls pobres a ple sol, gairebé sense aigua. Els capolls són les tàperes; es poda arran a l'hivern."],
    en: ["Caper bush", "A plant of Majorcan dry-stone walls. Lives in walls and poor soil in full sun on almost no water. The flower buds are the capers; cut back hard in winter."],
    de: ["Kapernstrauch", "Eine Pflanze der mallorquinischen Trockenmauern. Lebt in Mauern und kargen Böden in voller Sonne fast ohne Wasser. Die Knospen sind die Kapern; im Winter stark zurückschneiden."] }],
    ["Mandevilla sanderi", "sol semi", "medio", "no", false, {
    es: ["Dipladenia", "Flores en trompeta rojas, rosas o blancas de mayo a octubre. Perfecta para macetas y celosías al sol; resiste olvidos de riego. Su savia es irritante."],
    ca: ["Dipladènia", "Flors en trompeta vermelles, roses o blanques de maig a octubre. Perfecta per a tests i gelosies al sol; resisteix oblits de reg. La saba és irritant."],
    en: ["Dipladenia", "Red, pink or white trumpet flowers from May to October. Perfect for pots and trellises in sun; forgives missed waterings. Its sap is an irritant."],
    de: ["Dipladenie", "Rote, rosa oder weiße Trichterblüten von Mai bis Oktober. Ideal für Töpfe und Rankgitter in der Sonne; verzeiht vergessenes Gießen. Der Milchsaft reizt die Haut."] }],
    ["Solanum laxum", "sol semi", "medio", "no", false, {
    es: ["Falso jazmín", "Trepadora rápida que cubre una valla en un par de años, con racimos de flores blancas casi todo el año. Recórtala a final de invierno."],
    ca: ["Fals gessamí", "Enfiladissa ràpida que cobreix una tanca en un parell d'anys, amb raïms de flors blanques gairebé tot l'any. Retalla-la a final d'hivern."],
    en: ["Potato vine", "A fast climber that covers a fence in a couple of years, with clusters of white flowers almost all year. Trim in late winter."],
    de: ["Jasmin-Nachtschatten", "Schnelle Kletterpflanze, die einen Zaun in zwei Jahren begrünt, mit weißen Blütentrauben fast das ganze Jahr. Schnitt im Spätwinter."] }],
    ["Petunia × hybrida", "sol", "medio", "si", false, {
    es: ["Petunia", "Color sin parar de primavera a otoño en macetas y jardineras. Quita las flores secas, abona cada quince días y recórtala en pleno verano para que rebrote."],
    ca: ["Petúnia", "Color sense aturar de primavera a tardor en tests i jardineres. Lleva les flors seques, adoba cada quinze dies i retalla-la en ple estiu perquè rebroti."],
    en: ["Petunia", "Non-stop colour from spring to autumn in pots and window boxes. Deadhead, feed fortnightly and cut back in midsummer for a fresh flush."],
    de: ["Petunie", "Farbe ohne Pause von Frühling bis Herbst in Töpfen und Balkonkästen. Verblühtes entfernen, alle zwei Wochen düngen und im Hochsommer zurückschneiden."] }],
    ["Cyclamen persicum", "semi sombra", "medio", "no", false, {
    es: ["Ciclamen", "La flor del invierno para terrazas y entradas a la sombra. Riégalo por abajo, sin mojar el bulbo. En verano descansa: guárdalo fresco y casi sin agua."],
    ca: ["Ciclamen", "La flor de l'hivern per a terrasses i entrades a l'ombra. Rega'l per baix, sense banyar el bulb. A l'estiu descansa: guarda'l fresc i gairebé sense aigua."],
    en: ["Cyclamen", "The winter flower for shaded terraces and doorways. Water from below, keeping the tuber dry. It rests in summer: keep it cool and almost dry."],
    de: ["Alpenveilchen", "Die Winterblume für schattige Terrassen und Eingänge. Von unten gießen, die Knolle trocken halten. Im Sommer ruht es: kühl und fast trocken aufbewahren."] }],
    ["Catharanthus roseus", "sol", "bajo", "no", false, {
    es: ["Vinca", "La flor que mejor aguanta el calor de julio y agosto, cuando otras se rinden. Sol, poca agua y buen drenaje. Tóxica si se ingiere."],
    ca: ["Vinca", "La flor que millor aguanta la calor de juliol i agost, quan d'altres es rendeixen. Sol, poca aigua i bon drenatge. Tòxica si s'ingereix."],
    en: ["Madagascar periwinkle", "The flower that best stands the July and August heat, when others give up. Sun, little water and good drainage. Toxic if eaten."],
    de: ["Madagaskar-Immergrün", "Die Blume, die die Juli- und Augusthitze am besten aushält, wenn andere aufgeben. Sonne, wenig Wasser und gute Drainage. Giftig bei Verzehr."] }],
    ["Chrysanthemum × morifolium", "sol semi", "medio", "no", false, {
    es: ["Crisantemo", "La flor de Todos los Santos. Tras florecer, córtalo a ras y plántalo en el jardín: rebrota en primavera y vuelve a florecer cada otoño."],
    ca: ["Crisantem", "La flor de Tots Sants. Després de florir, talla'l arran i planta'l al jardí: rebrota a la primavera i torna a florir cada tardor."],
    en: ["Chrysanthemum", "The flower of All Saints' Day. After flowering, cut it right back and plant it out: it resprouts in spring and blooms again every autumn."],
    de: ["Chrysantheme", "Die Blume zu Allerheiligen. Nach der Blüte bodennah zurückschneiden und auspflanzen: Sie treibt im Frühling neu aus und blüht jeden Herbst wieder."] }],
    ["Mentha spicata", "semi", "alto", "?", false, {
    es: ["Hierbabuena", "Para infusiones, guisos y mojitos. Quiere humedad y algo de sombra en verano. Plántala siempre en maceta: en tierra se extiende sin control."],
    ca: ["Herba-sana", "Per a infusions, cuinats i mojitos. Vol humitat i un poc d'ombra a l'estiu. Planta-la sempre en test: en terra s'estén sense control."],
    en: ["Spearmint", "For teas, cooking and mojitos. Likes moisture and some shade in summer. Always grow it in a pot: in the ground it spreads out of control."],
    de: ["Grüne Minze (Hierbabuena)", "Für Tee, Küche und Mojitos. Mag Feuchtigkeit und im Sommer etwas Schatten. Immer im Topf halten: im Beet breitet sie sich unkontrolliert aus."] }],
    ["Ocimum basilicum", "sol semi", "alto", "si", false, {
    es: ["Albahaca", "La aromática del verano; dicen que ahuyenta los mosquitos. Riégala a diario con calor y pellizca las puntas para que no florezca y siga dando hojas. Es anual."],
    ca: ["Alfabeguera", "L'aromàtica de l'estiu; diuen que allunya els moscards. Rega-la cada dia amb calor i pessiga les puntes perquè no floreixi i continuï fent fulles. És anual."],
    en: ["Basil", "The herb of summer, said to keep mosquitoes away. Water daily in hot weather and pinch out the tips so it doesn't flower and keeps producing leaves. An annual."],
    de: ["Basilikum", "Das Sommerkraut, das angeblich Mücken fernhält. Bei Hitze täglich gießen und die Spitzen auskneifen, damit es nicht blüht und weiter Blätter bildet. Einjährig."] }],
    ["Kalanchoe blossfeldiana", "sol semi", "bajo", "no", false, {
    es: ["Kalanchoe", "Suculenta de flor que dura meses, dentro de casa o en la terraza. Mucha luz y poco riego: deja secar la tierra. Tóxica para mascotas."],
    ca: ["Kalanchoe", "Suculenta de flor que dura mesos, dins ca nostra o a la terrassa. Molta llum i poc reg: deixa assecar la terra. Tòxica per a mascotes."],
    en: ["Kalanchoe", "A flowering succulent that lasts for months, indoors or on the terrace. Plenty of light and little water: let the soil dry out. Toxic to pets."],
    de: ["Flammendes Käthchen", "Blühende Sukkulente, die monatelang hält, im Haus oder auf der Terrasse. Viel Licht und wenig Wasser: Erde abtrocknen lassen. Giftig für Haustiere."] }],
    ["Echeveria elegans", "sol semi", "bajo", "si", false, {
    es: ["Echeveria", "Rosetas perfectas, casi de piedra, para macetas y rocallas. Sol suave, tierra muy drenante y riego escaso: el agua en la roseta la pudre."],
    ca: ["Echevèria", "Rosetes perfectes, quasi de pedra, per a tests i rocalles. Sol suau, terra molt drenant i reg escàs: l'aigua dins la roseta la podreix."],
    en: ["Echeveria", "Perfect, almost stone-like rosettes for pots and rockeries. Gentle sun, very free-draining soil and sparse watering: water in the rosette rots it."],
    de: ["Echeverie", "Perfekte, fast steinerne Rosetten für Töpfe und Steingärten. Milde Sonne, sehr durchlässige Erde und sparsam gießen: Wasser in der Rosette lässt sie faulen."] }],
    ["Ficus benjamina", "semi sombra", "medio", "no", false, {
    es: ["Ficus benjamina", "Arbolito de interior de hoja pequeña. No le gusta que lo muevan: si cambia de sitio o hay corrientes, tira las hojas. Luz abundante sin sol directo."],
    ca: ["Ficus benjamina", "Arbret d'interior de fulla petita. No li agrada que el moguin: si canvia de lloc o hi ha corrents, tira les fulles. Llum abundant sense sol directe."],
    en: ["Weeping fig", "A small-leaved indoor tree. It dislikes being moved: a change of spot or a draught makes it drop its leaves. Plenty of light, no direct sun."],
    de: ["Birkenfeige", "Kleinblättriger Zimmerbaum. Mag keine Standortwechsel: Bei Umstellen oder Zugluft wirft sie die Blätter ab. Viel Licht ohne direkte Sonne."] }],
    ["Anthurium andraeanum", "semi sombra", "medio", "no", false, {
    es: ["Anturio", "Flores rojas y brillantes todo el año en interiores luminosos. Agradece la humedad: pulveriza las hojas y evita los radiadores. Tóxico para mascotas."],
    ca: ["Anturi", "Flors vermelles i lluents tot l'any en interiors lluminosos. Agraeix la humitat: polvoritza les fulles i evita els radiadors. Tòxic per a mascotes."],
    en: ["Anthurium", "Glossy red flowers all year in bright rooms. Enjoys humidity: mist the leaves and keep it away from radiators. Toxic to pets."],
    de: ["Flamingoblume", "Glänzend rote Blüten das ganze Jahr in hellen Räumen. Mag Luftfeuchtigkeit: Blätter besprühen und von Heizkörpern fernhalten. Giftig für Haustiere."] }],
    ["Nephrolepis exaltata", "semi sombra", "alto", "si", false, {
    es: ["Helecho", "Verde fresco para interiores, porches y patios sin sol. Tierra siempre húmeda y ambiente húmedo: se seca enseguida con el aire seco o el sol directo."],
    ca: ["Falguera", "Verd fresc per a interiors, porxos i patis sense sol. Terra sempre humida i ambient humit: s'asseca tot d'una amb l'aire sec o el sol directe."],
    en: ["Boston fern", "Fresh green for rooms, porches and sunless patios. Keep the soil moist and the air humid: it dries out quickly in dry air or direct sun."],
    de: ["Schwertfarn", "Frisches Grün für Räume, Veranden und sonnenlose Innenhöfe. Erde stets feucht und Luft feucht halten: Bei trockener Luft oder direkter Sonne vertrocknet er schnell."] }],
    ["Crithmum maritimum", "sol", "bajo", "?", true, {
    es: ["Hinojo marino", "El «fonoll marí» que en Mallorca se toma encurtido. Crece en las rocas junto al mar: aguanta salitre, viento y sequía como ninguna. Ideal para jardines en primera línea."],
    ca: ["Fonoll marí", "El fonoll marí que a Mallorca es menja envinagrat. Creix a les roques vora la mar: aguanta salinitat, vent i sequera com cap altra. Ideal per a jardins a primera línia."],
    en: ["Rock samphire", "The sea fennel that Majorcans eat pickled. It grows on seaside rocks: nothing copes better with salt, wind and drought. Ideal for seafront gardens."],
    de: ["Meerfenchel", "Der Meerfenchel, den man auf Mallorca eingelegt isst. Wächst auf Felsen am Meer: Nichts verträgt Salz, Wind und Trockenheit besser. Ideal für Gärten in erster Meereslinie."] }],
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
