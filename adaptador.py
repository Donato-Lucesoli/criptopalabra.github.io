archivo = open("diccionario.txt", "r", encoding="utf-8")
diccionario_real = open("palabras.js", "a+", encoding="utf-8")

diccionario = archivo.readlines()
palabras_español = []

for linea in diccionario:
    lista = linea.split("\n")
    palabras_español.append(lista[0])

archivo.close()

diccionario_real.write("export const WORDS = [")
for pal in palabras_español:
    diccionario_real.write(f"'{pal}',\n")
diccionario_real.write("]")

diccionario_real.close()